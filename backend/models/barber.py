from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base, barber_skills
from sqlalchemy import Table, ForeignKey

class Barber(Base):
    __tablename__ = "barbers"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    bio = Column(Text)
    years_experience = Column(Integer)
    is_verified = Column(Boolean, default=False)
    instagram_handle = Column(String(100))
    current_location_name = Column(String(200))

    user = relationship("User", back_populates="barber_profile")
    skills = relationship("Skill", secondary=barber_skills, back_populates="barbers")
    location_history = relationship("LocationHistory", back_populates="barber")
    certifications = relationship("Certification", back_populates="barber")
    services = relationship("Service", back_populates="barber")
    availability = relationship("Availability", back_populates="barber")
    posts = relationship("Post", back_populates="barber")
    bookings = relationship("Booking", back_populates="barber")
    favorited_by = relationship("Favorite", back_populates="barber")
    portfolio          = relationship("BarberPortfolio",        back_populates="barber", cascade="all, delete-orphan")
    salon_associations = relationship("SalonBarberAssociation", back_populates="barber", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = 'skills'
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    barbers = relationship("Barber", secondary=barber_skills, back_populates="skills")

class LocationHistory(Base):
    __tablename__ = 'location_history'
    id = Column(Integer, primary_key=True)
    barber_id = Column(Integer, ForeignKey('barbers.id'), nullable=False)
    location_name = Column(String(200), nullable=False)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True) # Null means "Current"
    barber = relationship("Barber", back_populates="location_history")

class Certification(Base):
    __tablename__ = 'certifications'
    id = Column(Integer, primary_key=True)
    barber_id = Column(Integer, ForeignKey('barbers.id'), nullable=False)
    name = Column(String(150), nullable=False)
    issuing_body = Column(String(100))
    image_url = Column(String(255))
    barber = relationship("Barber", back_populates="certifications")