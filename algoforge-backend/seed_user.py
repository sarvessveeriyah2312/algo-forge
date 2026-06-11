"""Seed a default analyst user into the database."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole


EMAIL = "admin@algoforge.com"
USERNAME = "admin"
PASSWORD = "admin123"
FULL_NAME = "AlgoForge Admin"
ROLE = UserRole.ANALYST


async def seed_user() -> None:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == EMAIL))
        if result.scalar_one_or_none():
            print(f"[SKIP] User '{EMAIL}' already exists.")
            return

        user = User(
            email=EMAIL,
            username=USERNAME,
            hashed_password=hash_password(PASSWORD),
            full_name=FULL_NAME,
            role=ROLE,
            is_active=True,
            is_superuser=False,
        )
        session.add(user)
        await session.commit()
        print(f"[OK] User created — email: {EMAIL}  password: {PASSWORD}")


if __name__ == "__main__":
    asyncio.run(seed_user())
