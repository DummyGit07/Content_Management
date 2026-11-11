from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Annotated
from src.database.db import get_db
from sqlalchemy.orm import Session
from src.schemas.user import User
from starlette import status
from passlib.context import CryptContext

router = APIRouter(
    prefix='/api/auth',
    tags=['auth']
)

db_dependency = Annotated[Session, Depends(get_db)]
bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

class CreateUserRequest(BaseModel):
    user_name:str
    user_password:str


@router.post("/register", status_code=status.HTTP_201_CREATED)
def create_user(db: db_dependency, create_user_request:CreateUserRequest):
    print("\n\n---- Creating User ---")

    user = db.query(User).filter(User.name == create_user_request.user_name).first()

    if user is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")     

    create_user_model = User(
        name= create_user_request.user_name,
        hashed_password= bcrypt_context.hash(create_user_request.user_password)
    )

    db.add(create_user_model)
    db.commit()

    print("--- User Created ---\n\n")
