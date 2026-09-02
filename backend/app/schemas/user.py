from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole
from app.schemas.common import BaseSchema

class UserBase(BaseSchema):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.CANDIDATE
    organization_id: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: Optional[str] = None
    firebase_uid: Optional[str] = None

class UserUpdate(BaseSchema):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserOut(UserBase):
    id: str
    organization_id: str
    firebase_uid: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class LoginRequest(BaseModel):
    email: str
    password: str

class MockLoginRequest(BaseModel):
    role: UserRole = UserRole.CANDIDATE
    email: Optional[str] = None
    name: Optional[str] = None
