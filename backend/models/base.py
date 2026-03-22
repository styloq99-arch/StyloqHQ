from sqlalchemy import create_engine, Table, Column, Integer, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from the correct path (backend/.env)
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)

# Use Supabase PostgreSQL connection or fallback to SQLite
USE_POSTGRES = os.getenv("USE_POSTGRES", "true").lower() == "true"

if USE_POSTGRES:
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        # Fallback: Supabase pooler (session mode, port 5432)
        # Password is URL-encoded (. → %2E)
        DATABASE_URL = "postgresql+psycopg2://postgres.sbtmqbfkcswsgkjimujf:S4KSzzLKg5%2E7CM-@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
    engine = create_engine(
        DATABASE_URL,
        echo=True,
        pool_pre_ping=True,
        pool_recycle=300
    )
else:
    DATABASE_URL = "sqlite:///database.db"
    engine = create_engine(DATABASE_URL, echo=True)

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
    Column("barber_id", Integer, ForeignKey("barbers.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True)
)

# IMPORTANT: import models so SQLAlchemy registers them
from models import user
from models import barber
from models import booking
from models import social