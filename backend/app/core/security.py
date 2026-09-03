import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials

from app.core.config import settings

security_scheme = HTTPBearer(auto_error=False)

# Initialize Firebase Admin SDK if configured
_firebase_app = None
if settings.FIREBASE_CREDENTIALS_PATH:
    try:
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        _firebase_app = firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Warning: Failed to initialize Firebase Admin SDK with cert: {e}")
elif settings.FIREBASE_PROJECT_ID:
    try:
        _firebase_app = firebase_admin.initialize_app(options={'projectId': settings.FIREBASE_PROJECT_ID})
    except Exception as e:
        print(f"Warning: Failed to initialize Firebase Admin SDK: {e}")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def verify_auth_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> Dict[str, Any]:
    """
    Verifies Firebase token or local JWT token depending on payload.
    Supports local mock dev authentication as well.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    # 1. Check if it's our internal JWT
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        pass
    
    # 2. Check if it's a Firebase token
    if _firebase_app:
        try:
            decoded_token = firebase_auth.verify_id_token(token)
            return {
                "sub": decoded_token.get("uid"),
                "email": decoded_token.get("email"),
                "phone_number": decoded_token.get("phone_number"),
                "firebase_uid": decoded_token.get("uid"),
                "name": decoded_token.get("name", ""),
            }
        except Exception:
            pass

    # 3. Fallback for mock/dev token format "mock:user_id:role"
    if settings.MOCK_AUTH_ENABLED and token.startswith("mock:"):
        parts = token.split(":")
        if len(parts) >= 3:
            return {
                "sub": parts[1],
                "email": f"{parts[1]}@cloudops.internal",
                "role": parts[2].upper(),
                "name": f"Mock {parts[2].capitalize()}"
            }

    # 4. All auth methods failed — raise 401
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )

async def verify_optional_auth_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> Optional[Dict[str, Any]]:
    if not credentials:
        return None
    try:
        token = credentials.credentials
        try:
            return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        except JWTError:
            pass
        
        if _firebase_app:
            try:
                decoded_token = firebase_auth.verify_id_token(token)
                return {
                    "sub": decoded_token.get("uid"),
                    "email": decoded_token.get("email"),
                    "phone_number": decoded_token.get("phone_number"),
                    "firebase_uid": decoded_token.get("uid"),
                    "name": decoded_token.get("name", ""),
                }
            except Exception:
                pass

        if settings.MOCK_AUTH_ENABLED and token.startswith("mock:"):
            parts = token.split(":")
            if len(parts) >= 3:
                return {
                    "sub": parts[1],
                    "email": f"{parts[1]}@cloudops.internal",
                    "role": parts[2].upper(),
                    "name": f"Mock {parts[2].capitalize()}"
                }
        return None
    except Exception:
        return None

def verify_firebase_id_token(token: str) -> Dict[str, Any]:
    """Verifies a Firebase ID token (works for both Email/Password and Phone OTP auth)."""
    if _firebase_app:
        try:
            decoded_token = firebase_auth.verify_id_token(token)
            return {
                "uid": decoded_token.get("uid"),
                "phone_number": decoded_token.get("phone_number"),
                "email": decoded_token.get("email"),
                "name": decoded_token.get("name") or decoded_token.get("phone_number", "Firebase User"),
                "firebase_uid": decoded_token.get("uid")
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Firebase Token Verification Failed: {str(e)}"
            )

    # Dev/Mock fallback
    if settings.MOCK_AUTH_ENABLED:
        return {
            "uid": "mock-firebase-uid-12345",
            "phone_number": "+919876543210",
            "email": "phoneuser@cloudops.internal",
            "name": "Mock Phone User",
            "firebase_uid": "mock-firebase-uid-12345"
        }

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Firebase Admin SDK is not initialized on backend."
    )
