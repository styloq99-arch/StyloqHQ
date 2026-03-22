from sqlalchemy import create_engine, Table, Column, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from the correct path (backend/.env)
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)

# We're directly connected to Supabase PostgreSQL, so SQLite fallback is removed.
from sqlalchemy.pool import NullPool

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set.")

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
    pool_recycle=300,
    poolclass=NullPool
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# Association table
barber_skills = Table(
    "barber_skills",
    Base.metadata,
    Column("barber_id", UUID(as_uuid=True), ForeignKey("barbers.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True)
)

# IMPORTANT: import models so SQLAlchemy registers them
from models import user
from models import barber
from models import booking
from models import social