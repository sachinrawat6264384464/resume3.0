from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    role: UserRole = UserRole.CANDIDATE

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: Optional[bool] = None

class UserOut(UserBase):
    id: str
    organization_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

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

class FirebasePhoneLoginRequest(BaseModel):
    id_token: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.CANDIDATE

class SendOTPRequest(BaseModel):
    email: Optional[str] = None
    phone_number: Optional[str] = None
    channel: Optional[str] = "email"

class VerifyOTPRequest(BaseModel):
    email: Optional[str] = None
    phone_number: Optional[str] = None
    otp: str
    full_name: Optional[str] = None
    password: Optional[str] = None
