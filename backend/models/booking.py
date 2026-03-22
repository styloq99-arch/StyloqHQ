from sqlalchemy import Column, Integer, String, Float, DateTime, Time, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base

class Booking(Base):
    __tablename__ = 'bookings'
    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey('clients.id'), nullable=False)
    barber_id = Column(UUID(as_uuid=True), ForeignKey('barbers.id'), nullable=False)
    service_id = Column(Integer, ForeignKey('services.id'), nullable=False)
    hairstyle_id = Column(Integer, ForeignKey('hairstyles.id'), nullable=True) # AI Link
    appointment_datetime = Column(DateTime, nullable=False)
    status = Column(String(20), default="Pending") 
    
    client = relationship("Client", back_populates="bookings")
    barber = relationship("Barber", back_populates="bookings")
    service = relationship("Service", back_populates="bookings")
    hairstyle = relationship("Hairstyle", back_populates="bookings")
    review = relationship("Review", back_populates="booking", uselist=False)

class Service(Base):
    __tablename__ = 'services'
    id = Column(Integer, primary_key=True)
    barber_id = Column(UUID(as_uuid=True), ForeignKey('barbers.id'), nullable=False)
    name = Column(String(100), nullable=False)
    price = Column(Float, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    barber = relationship("Barber", back_populates="services")
    bookings = relationship("Booking", back_populates="service")

class Hairstyle(Base):
    __tablename__ = 'hairstyles'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    face_shape_match = Column(String(50))
    image_url = Column(String(255))
    bookings = relationship("Booking", back_populates="hairstyle")

class Availability(Base):
    __tablename__ = 'availability'
    id = Column(Integer, primary_key=True)
    barber_id = Column(UUID(as_uuid=True), ForeignKey('barbers.id'), nullable=False)
    day_of_week = Column(Integer, nullable=False) # 0=Mon
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    barber = relationship("Barber", back_populates="availability")