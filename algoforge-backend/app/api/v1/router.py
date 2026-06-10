"""Main v1 API router — includes all sub-routers."""
from fastapi import APIRouter

from app.api.v1.routes import backtest, indicators, mt5, results, strategies
from app.api.v1.routes.auth import router as auth_router, users_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(strategies.router)
api_router.include_router(indicators.router)
api_router.include_router(backtest.router)
api_router.include_router(mt5.router)
api_router.include_router(results.router)
