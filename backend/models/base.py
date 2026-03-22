from sqlalchemy import create_engine, Table, Column, Integer, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Use Supabase PostgreSQL connection
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:S4KSzzLKg5.7CM-@db.sbtmqbfkcswsgkjimujf.supabase.co:5432/postgres"
)

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,  # Verify connections before using them
    pool_recycle=300     # Recycle connections after 5 minutes
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
    Column("barber_id", Integer, ForeignKey("barbers.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True)
)

# IMPORTANT: import models so SQLAlchemy registers them
from models import user
from models import barber
from models import booking
from models import social