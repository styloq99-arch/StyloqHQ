from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, ForeignKey, Table

Base = declarative_base()

# Many-to-Many association for Barber Skills
barber_skills = Table('barber_skills', Base.metadata,
    Column('barber_id', Integer, ForeignKey('barbers.id')),
    Column('skill_id', Integer, ForeignKey('skills.id'))
)