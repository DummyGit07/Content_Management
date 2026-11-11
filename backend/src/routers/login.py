from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from src.database.db import get_db
from sqlalchemy.orm import Session
from src.schemas.user import User
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from starlette import status
from datetime import timedelta, datetime, timezone
from jose import jwt, JWTError
from src.config import settings
from pydantic import BaseModel

router = APIRouter(
    prefix='/api/auth',
    tags=['auth']
)

class Token(BaseModel):
    access_token:str
    token_type:str

class LoginUserRequest(BaseModel):
    user_name: str
    user_password: str

db_dependency = Annotated[Session, Depends(get_db)]
bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='api/auth/login')

def authenticate_user(username:str, password: str, db):
    user = db.query(User).filter(User.name == username).first()

    if user is None:
        return False

    if not bcrypt_context.verify(password, user.hashed_password):
        return False

    return user

def create_access_token(username: str, user_id:int):
    expires = datetime.now(timezone.utc) + timedelta(minutes=20)

    encode = {'sub':username, 'id':user_id, 'exp':expires}
    return jwt.encode(encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get('sub')
        user_id: int = payload.get('id')

        if not username or not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

        return {'username':username, 'id':user_id}

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
        

@router.get("/me")
def get_user_profile(user: Annotated[dict, Depends(get_current_user)]):
    return user

@router.post("/login", response_model=Token)
def login_for_access_token(db: db_dependency, login_request: LoginUserRequest):
    user = authenticate_user(login_request.user_name, login_request.user_password, db)

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Unauthorized')

    token = create_access_token(user.name, user.id)

    return {'access_token': token, 'token_type':'bearer'}