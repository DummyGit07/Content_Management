from src.database.db import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)

    contacts = relationship(
    "Contact",
    back_populates="owner"
)