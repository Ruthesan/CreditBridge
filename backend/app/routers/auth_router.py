import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.db_models import Business
from app.models import UserCreate, UserLogin, Token, UserOut
from app.security import hash_password, verify_password, create_access_token
from app.deps import get_current_business

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(Business).filter(Business.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    business = Business(
        business_id=f"biz_{uuid.uuid4().hex[:12]}",
        email=payload.email,
        password_hash=hash_password(payload.password),
        business_name=payload.business_name,
        created_at=datetime.utcnow(),
    )
    db.add(business)
    db.commit()
    db.refresh(business)

    token = create_access_token(business.business_id)
    return Token(access_token=token, user=_to_user_out(business))


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.email == payload.email).first()
    if not business or not verify_password(payload.password, business.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    token = create_access_token(business.business_id)
    return Token(access_token=token, user=_to_user_out(business))


@router.get("/me", response_model=UserOut)
def me(current: Business = Depends(get_current_business)):
    return _to_user_out(current)


def _to_user_out(business: Business) -> UserOut:
    return UserOut(
        business_id=business.business_id,
        email=business.email,
        business_name=business.business_name,
        created_at=business.created_at,
    )
