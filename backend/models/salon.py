from sqlalchemy import Column, Integer, String, Time, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class SalonBarberAssociation(Base):
    __tablename__ = 'salon_barber_associations'

    id                 = Column(Integer, primary_key=True)
    salon_id           = Column(Integer, ForeignKey('salons.id',  ondelete="CASCADE"), nullable=False)
    barber_id          = Column(Integer, ForeignKey('barbers.id', ondelete="CASCADE"), nullable=False)
    invitation_status  = Column(String(20), default='Pending')   # Pending|Accepted|Rejected|Revoked
    salon_rules_active = Column(Integer, default=0)              # 1 = enforce salon hours

    salon  = relationship("Salon",  back_populates="barber_associations")
    barber = relationship("Barber", back_populates="salon_associations")


class SalonAvailability(Base):
    __tablename__ = 'salon_availability'

    id          = Column(Integer, primary_key=True)
    salon_id    = Column(Integer, ForeignKey('salons.id', ondelete="CASCADE"), nullable=False)
    day_of_week = Column(Integer, nullable=False)   # 0 = Monday … 6 = Sunday
    start_time  = Column(Time,    nullable=False)
    end_time    = Column(Time,    nullable=False)
    is_active   = Column(Integer, default=1)

    salon = relationship("Salon", back_populates="availability")