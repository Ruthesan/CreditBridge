from datetime import datetime, timedelta
import bcrypt
from jose import jwt, JWTError
from app.config import settings

# Bcrypt truncates/errors past 72 bytes; encode+truncate explicitly rather
# than letting a long password silently fail or behave inconsistently
# across bcrypt versions.
_MAX_PASSWORD_BYTES = 72


def hash_password(password: str) -> str:
    encoded = password.encode("utf-8")[:_MAX_PASSWORD_BYTES]
    return bcrypt.hashpw(encoded, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    encoded = plain.encode("utf-8")[:_MAX_PASSWORD_BYTES]
    return bcrypt.checkpw(encoded, hashed.encode("utf-8"))


def create_access_token(business_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": business_id, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

