from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    full_name = Column(String(100), nullable=False)
    phone_number = Column(String(20))
    role = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    client_profile = relationship("Client", back_populates="user", uselist=False)
    barber_profile = relationship("Barber", back_populates="user", uselist=False)
    salon_profile = relationship("Salon", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    liked_posts = relationship("PostLike", back_populates="user", cascade="all, delete-orphan")
    saved_posts = relationship("SavedPost", back_populates="user", cascade="all, delete-orphan")
    
    sent_messages = relationship("Message", foreign_keys="[Message.sender_id]", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="[Message.receiver_id]", back_populates="receiver")

class Client(Base):
    __tablename__ = 'clients'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    hair_type = Column(String(50))
    face_shape = Column(String(50))

    user = relationship("User", back_populates="client_profile")
    bookings = relationship("Booking", back_populates="client")
    favorites = relationship("Favorite", back_populates="client")
    events = relationship("Event", back_populates="client")

class Salon(Base):
    __tablename__ = 'salons'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    salon_name = Column(String(150), nullable=False)
    address = Column(String(255), nullable=False)
    
    user = relationship("User", back_populates="salon_profile")