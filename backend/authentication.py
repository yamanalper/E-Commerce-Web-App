from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session 
from . import models, schemas, database
from typing import Annotated

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data : dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:    
        expire = datetime.utcnow() + expires_delta 
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    jwt_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return jwt_token

def get_current_user(token : Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(database.get_db)): 
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        stored_email = payload.get("sub")
        if stored_email is None:
            print("No email found in token")
            raise credentials_exception
    except JWTError:
        print("Failed to decode JWT")
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == stored_email).first()
    if is_token_blacklisted(token, db):
        print("Token is blacklisted")
        raise credentials_exception
    if user is None:
        raise credentials_exception
    return user

def invalidate_token(token: str, db: Session):
    blacklisted_token = models.TokenBlacklist(token=token)
    db.add(blacklisted_token)
    db.commit()
    return True

def is_token_blacklisted(token: str, db: Session):
    blacklisted = db.query(models.TokenBlacklist).filter(models.TokenBlacklist.token == token).first()
    return blacklisted is not None

def require_roles(allowed_roles: list[str]):
    def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Operation not permitted")
        return current_user
    return role_checker