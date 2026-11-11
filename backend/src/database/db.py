
from src.config import settings

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase


db_url = settings.DATABASE_URL

# SQLite requires a special connection argument
connect_args = {}

if settings.LOCAL_STORAGE == True:
    db_url = settings.LOCAL_DB_URL
    connect_args = {"check_same_thread": False}


engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)


SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
