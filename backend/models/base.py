from sqlalchemy import create_engine, Table, Column, Integer, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///database.db"

engine = create_engine(
    DATABASE_URL,
    echo=True
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
import backend.models.user
import backend.models.barber
import backend.models.booking
import backend.models.social