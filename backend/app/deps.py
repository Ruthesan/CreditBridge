from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import decode_access_token
from app.db_models import Business

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_business(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> Business:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    business_id = decode_access_token(token)
    if business_id is None:
        raise credentials_exception

    business = db.query(Business).filter(Business.business_id == business_id).first()
    if business is None:
        raise credentials_exception
    return business
