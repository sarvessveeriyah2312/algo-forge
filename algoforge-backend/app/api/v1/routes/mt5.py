"""MetaTrader5 integration endpoints."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, verify_api_key
from app.schemas.mt5 import (
    AccountInfo,
    MT5ConnectRequest,
    MT5StatusResponse,
    RatesResponse,
    SymbolInfo,
)
from app.services.mt5_service import MT5ConnectionError, mt5_service

router = APIRouter(
    prefix="/mt5",
    tags=["MT5"],
    dependencies=[Depends(verify_api_key)],
)


@router.get("/status", response_model=MT5StatusResponse)
async def get_status() -> MT5StatusResponse:
    """Return the current MT5 connection status."""
    connected = mt5_service.is_connected()
    account_info = None
    if connected:
        try:
            account_info = await mt5_service.get_account_info()
        except Exception:
            account_info = None
    return MT5StatusResponse(connected=connected, account_info=account_info)


@router.post("/connect")
async def connect_mt5(data: MT5ConnectRequest) -> dict[str, Any]:
    """Connect to a MetaTrader5 terminal."""
    try:
        account_info = await mt5_service.initialize(
            login=data.login,
            password=data.password,
            server=data.server,
            path=data.path,
        )
        return {"success": True, "account_info": account_info}
    except MT5ConnectionError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to connect to MT5: {exc}",
        ) from exc


@router.post("/disconnect")
async def disconnect_mt5() -> dict[str, str]:
    """Disconnect from MetaTrader5."""
    await mt5_service.shutdown()
    return {"status": "disconnected"}


@router.get("/symbols")
async def get_symbols() -> list[str]:
    """Return a list of available trading symbols."""
    return await mt5_service.get_symbols()


@router.get("/symbols/{symbol}/info", response_model=SymbolInfo)
async def get_symbol_info(symbol: str) -> SymbolInfo:
    """Return detailed information about a specific symbol."""
    info = await mt5_service.get_symbol_info(symbol)
    return SymbolInfo(**info)


@router.get("/symbols/{symbol}/rates", response_model=RatesResponse)
async def get_rates(
    symbol: str,
    timeframe: str = Query("H1", description="Timeframe: M1, M5, M15, M30, H1, H4, D1"),
    date_from: datetime = Query(..., description="Start datetime (ISO format)"),
    date_to: datetime = Query(..., description="End datetime (ISO format)"),
) -> RatesResponse:
    """Fetch OHLCV bars for a symbol and timeframe."""
    df = await mt5_service.get_rates(symbol, timeframe, date_from, date_to)
    bars = df.to_dict(orient="records")
    # Convert timestamps to string for JSON serialisation
    for bar in bars:
        if "time" in bar and hasattr(bar["time"], "isoformat"):
            bar["time"] = bar["time"].isoformat()
    return RatesResponse(symbol=symbol, timeframe=timeframe, bars=bars)


@router.get("/account", response_model=AccountInfo)
async def get_account_info() -> AccountInfo:
    """Return the current MT5 account information."""
    info = await mt5_service.get_account_info()
    return AccountInfo(**info)


@router.get("/server-time")
async def get_server_time() -> dict[str, str]:
    """Return the MT5 server time."""
    server_time = await mt5_service.get_server_time()
    return {"server_time": server_time.isoformat()}
