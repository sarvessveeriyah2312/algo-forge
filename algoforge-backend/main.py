"""
AlgoForge API — main application entry point.

Starts FastAPI with:
- CORS middleware
- API key middleware (skip /health, /docs, /openapi.json)
- v1 router mounted at /api/v1
- WebSocket endpoint for live backtest log streaming
- Startup: DB init, seed, MT5 connect attempt
- Shutdown: MT5 disconnect
"""
from __future__ import annotations

import asyncio
import json
import logging
import logging.config
from datetime import datetime
from typing import Any

import uuid as _uuid

from fastapi import FastAPI, Request, Response, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from sqlalchemy import select

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import AsyncSessionLocal, init_db
from app.models.backtest import BacktestRun, BacktestStatusEnum
from app.services.mt5_service import MT5ConnectionError, mt5_service

# ──────────────────────────────────────────────
# Structured JSON logging
# ──────────────────────────────────────────────

class _JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "ts": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        if record.exc_info:
            log_obj["exc"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)


def _setup_logging() -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(_JSONFormatter())
    root = logging.getLogger()
    root.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    root.handlers = [handler]


_setup_logging()
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# FastAPI application
# ──────────────────────────────────────────────

app = FastAPI(
    title="AlgoForge API",
    description="Algorithmic trading strategy builder and backtester",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── API Key middleware (skip public paths) ──
_PUBLIC_PATHS = {"/health", "/docs", "/redoc", "/openapi.json", "/favicon.ico"}


@app.middleware("http")
async def api_key_middleware(request: Request, call_next) -> Response:
    """Check X-API-Key header for all non-public routes."""
    path = request.url.path
    # Allow public paths and websocket handshakes
    if path in _PUBLIC_PATHS or path.startswith("/ws/") or request.method == "OPTIONS":
        return await call_next(request)

    api_key = request.headers.get("X-API-Key", "")
    if api_key != settings.API_KEY:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Invalid or missing API key."},
        )
    return await call_next(request)


# ── Include routers ──
app.include_router(api_router, prefix="/api/v1")


# ──────────────────────────────────────────────
# Health check
# ──────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check() -> dict[str, Any]:
    """Return service health status."""
    return {
        "status": "ok",
        "db": "connected",
        "mt5": mt5_service.is_connected(),
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat(),
    }


# ──────────────────────────────────────────────
# WebSocket connection manager
# ──────────────────────────────────────────────

class ConnectionManager:
    """Manages active WebSocket connections keyed by run_id."""

    def __init__(self) -> None:
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, run_id: str, ws: WebSocket) -> None:
        await ws.accept()
        if run_id not in self.active:
            self.active[run_id] = []
        self.active[run_id].append(ws)
        logger.debug("WebSocket connected for run_id=%s", run_id)

    def disconnect(self, run_id: str, ws: WebSocket) -> None:
        connections = self.active.get(run_id, [])
        if ws in connections:
            connections.remove(ws)
        if not connections:
            self.active.pop(run_id, None)
        logger.debug("WebSocket disconnected for run_id=%s", run_id)

    async def broadcast(self, run_id: str, message: dict) -> None:
        """Send a JSON message to all connected clients for run_id."""
        connections = list(self.active.get(run_id, []))
        disconnected: list[WebSocket] = []
        for ws in connections:
            try:
                await ws.send_json(message)
            except Exception:
                disconnected.append(ws)
        for ws in disconnected:
            self.disconnect(run_id, ws)

    async def broadcast_log_line(self, run_id: str, line: str) -> None:
        """Convenience method — broadcast a single log line."""
        await self.broadcast(run_id, {
            "type": "log",
            "run_id": run_id,
            "message": line,
            "timestamp": datetime.utcnow().isoformat(),
        })


manager = ConnectionManager()


@app.websocket("/ws/backtest/{run_id}")
async def websocket_backtest(websocket: WebSocket, run_id: str) -> None:
    """
    Stream backtest progress and log output to the client.

    Behaviour:
    - While PENDING / RUNNING: sends a "progress" heartbeat every 2 s so the
      frontend progress bar advances even before logs are available.
    - On COMPLETED: streams all engine log lines with a 25 ms gap (live-terminal
      effect), then sends {"type": "complete"} so the frontend fetches results.
    - On FAILED: sends the error message then {"type": "complete"}.
    """
    await manager.connect(run_id, websocket)
    try:
        try:
            run_uuid = _uuid.UUID(run_id)
        except ValueError:
            await websocket.send_json({"type": "error", "message": "Invalid run ID"})
            return

        while True:
            # Open a fresh session each iteration so we never read a stale cache.
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(BacktestRun).where(BacktestRun.id == run_uuid)
                )
                run = result.scalar_one_or_none()

            if run is None:
                await websocket.send_json({"type": "error", "message": "Run not found"})
                break

            if run.status in (BacktestStatusEnum.PENDING, BacktestStatusEnum.RUNNING):
                await websocket.send_json({
                    "type": "progress",
                    "status": run.status.value,
                })
                await asyncio.sleep(2)

            elif run.status == BacktestStatusEnum.COMPLETED:
                if run.log_output:
                    lines = [l for l in run.log_output.split("\n") if l.strip()]
                    for line in lines:
                        await websocket.send_json({"type": "log", "message": line})
                        await asyncio.sleep(0.025)
                await websocket.send_json({"type": "complete"})
                break

            else:  # FAILED
                error = run.error_message or "Backtest failed (no details recorded)"
                await websocket.send_json({"type": "log", "message": f"[FAILED] {error}"})
                await websocket.send_json({"type": "complete"})
                break

    except (WebSocketDisconnect, Exception):
        pass
    finally:
        manager.disconnect(run_id, websocket)


# ──────────────────────────────────────────────
# Startup / Shutdown events
# ──────────────────────────────────────────────

@app.on_event("startup")
async def on_startup() -> None:
    logger.info("AlgoForge API starting up (version=%s)", settings.VERSION)

    # Initialise database tables
    try:
        await init_db()
        logger.info("Database tables initialised.")
    except Exception as exc:
        logger.error("Failed to initialise database: %s", exc, exc_info=True)

    # Seed database with initial data if empty
    try:
        from app.core.database import AsyncSessionLocal
        from seed import seed_database
        async with AsyncSessionLocal() as db:
            await seed_database(db)
    except Exception as exc:
        logger.warning("Seed step skipped or failed: %s", exc)

    # Attempt MT5 connection if credentials are configured
    if settings.MT5_LOGIN and settings.MT5_PASSWORD and settings.MT5_SERVER:
        try:
            await mt5_service.initialize(
                login=settings.MT5_LOGIN,
                password=settings.MT5_PASSWORD,
                server=settings.MT5_SERVER,
                path=settings.MT5_PATH,
            )
            logger.info("MT5 connected successfully.")
        except MT5ConnectionError as exc:
            logger.warning("MT5 auto-connect failed (will retry on demand): %s", exc)
        except Exception as exc:
            logger.warning("MT5 auto-connect error: %s", exc)
    else:
        logger.info("MT5 credentials not configured — running without live MT5 connection.")


@app.on_event("shutdown")
async def on_shutdown() -> None:
    logger.info("AlgoForge API shutting down.")
    try:
        await mt5_service.shutdown()
        logger.info("MT5 disconnected.")
    except Exception as exc:
        logger.warning("MT5 shutdown error: %s", exc)


# ──────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info",
    )
