from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "postgresql+asyncpg://identity_user:identity_pass@identity-db:5432/identity_db"


# Engine (connection to DB)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)


# Session factory
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


# Base class for models
class Base(DeclarativeBase):
    pass