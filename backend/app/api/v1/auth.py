from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import verify_auth_token
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, LoginRequest, MockLoginRequest, TokenResponse, UserOut
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=StandardResponse[UserOut], status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    user = await service.register_user(user_in)
    return StandardResponse(
        message="User registered successfully",
        data=UserOut.model_validate(user)
    )

@router.post("/login", response_model=TokenResponse)
async def login(login_req: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.authenticate_local(login_req)

@router.post("/mock-login", response_model=TokenResponse)
async def mock_login(mock_req: MockLoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.authenticate_mock(mock_req)

@router.get("/me", response_model=StandardResponse[UserOut])
async def get_me(payload: dict = Depends(verify_auth_token), db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    user = await service.get_current_user_from_payload(payload)
    return StandardResponse(
        message="User retrieved",
        data=UserOut.model_validate(user)
    )
