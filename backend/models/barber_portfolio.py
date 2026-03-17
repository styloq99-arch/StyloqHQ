from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
from datetime import datetime

class BarberPortfolio(Base):
    __tablename__ = 'barber_portfolio'
    id = Column(Integer, primary_key=True)
    barber_id = Column(Integer, ForeignKey('barbers.id'), nullable=False)
    image_url = Column(String(500), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    barber = relationship("Barber", back_populates="portfolio")
