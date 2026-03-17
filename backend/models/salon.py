from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Time
from sqlalchemy.orm import relationship
from .base import Base

class Salon(Base):
    __tablename__ = 'salons'
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    address = Column(String(500))
    barbers = relationship("SalonBarberAssociation", back_populates="salon")

class SalonBarberAssociation(Base):
    __tablename__ = 'salon_barber_associations'
    id = Column(Integer, primary_key=True)
    salon_id = Column(Integer, ForeignKey('salons.id'), nullable=False)
    barber_id = Column(Integer, ForeignKey('barbers.id'), nullable=False)
    invitation_status = Column(String(20), default='Pending')
    salon_rules_active = Column(Boolean, default=False)
    salon = relationship("Salon", back_populates="barbers")
    barber = relationship("Barber")

class SalonAvailability(Base):
    __tablename__ = 'salon_availability'
    id = Column(Integer, primary_key=True)
    salon_id = Column(Integer, ForeignKey('salons.id'), nullable=False)
    day_of_week = Column(Integer, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_active = Column(Boolean, default=True)
    salon = relationship("Salon")
