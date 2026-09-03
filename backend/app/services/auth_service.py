from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.models.candidate import Candidate
from app.schemas.user import UserCreate, LoginRequest, MockLoginRequest, TokenResponse, UserOut
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_default_org(self) -> Organization:
        stmt = select(Organization).where(Organization.slug == "default")
        result = await self.db.execute(stmt)
        org = result.scalar_one_or_none()
        if not org:
            org = Organization(
                name="CloudOps Academy",
                slug="default",
                description="Default Organization for Internal Assessments"
            )
            self.db.add(org)
            await self.db.flush()
        return org

    async def register_user(self, user_in: UserCreate) -> User:
        # Check existing email
        stmt = select(User).where(User.email == user_in.email)
        result = await self.db.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        org_id = user_in.organization_id
        if not org_id:
            org = await self.get_or_create_default_org()
            org_id = org.id

        hashed_pwd = get_password_hash(user_in.password) if user_in.password else None
        
        user = User(
            email=user_in.email,
            phone_number=user_in.phone_number,
            full_name=user_in.full_name,
            hashed_password=hashed_pwd,
            role=user_in.role.value if isinstance(user_in.role, UserRole) else str(user_in.role),
            organization_id=org_id,
            firebase_uid=user_in.firebase_uid,
            is_active=user_in.is_active
        )
        self.db.add(user)
        await self.db.flush()

        # If role is CANDIDATE, initialize candidate profile
        if user.role == UserRole.CANDIDATE.value:
            candidate = Candidate(
                user_id=user.id,
                organization_id=org_id,
                target_role="CloudOps Engineer",
                experience_level="JUNIOR",
                phone=user_in.phone_number
            )
            self.db.add(candidate)
            await self.db.flush()

        return user

    async def authenticate_local(self, login_data: LoginRequest) -> TokenResponse:
        stmt = select(User).where(User.email == login_data.email)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user or not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
            
        if not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        token_data = {
            "sub": user.id,
            "email": user.email,
            "role": user.role,
            "organization_id": user.organization_id,
            "name": user.full_name
        }
        token = create_access_token(token_data)
        return TokenResponse(
            access_token=token,
            user=UserOut.model_validate(user)
        )

    async def authenticate_mock(self, mock_req: MockLoginRequest) -> TokenResponse:
        """Instant demo login for testing student or admin flow without credentials."""
        role_str = mock_req.role.value if isinstance(mock_req.role, UserRole) else str(mock_req.role)
        email = mock_req.email or f"{role_str.lower()}@cloudops.internal"
        name = mock_req.name or f"Demo {role_str.capitalize()}"

        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            org = await self.get_or_create_default_org()
            user = User(
                email=email,
                full_name=name,
                role=role_str,
                organization_id=org.id,
                is_active=True
            )
            self.db.add(user)
            await self.db.flush()

            if role_str == UserRole.CANDIDATE.value:
                cand = Candidate(
                    user_id=user.id,
                    organization_id=org.id,
                    target_role="CloudOps Engineer",
                    experience_level="MID"
                )
                self.db.add(cand)
                await self.db.flush()

        token_data = {
            "sub": user.id,
            "email": user.email,
            "role": user.role,
            "organization_id": user.organization_id,
            "name": user.full_name
        }
        token = create_access_token(token_data)
        return TokenResponse(
            access_token=token,
            user=UserOut.model_validate(user)
        )

    async def get_current_user_from_payload(self, payload: Dict[str, Any]) -> User:
        user_id = payload.get("sub")
        email = payload.get("email")
        
        user = None
        if user_id:
            stmt = select(User).where(User.id == user_id)
            result = await self.db.execute(stmt)
            user = result.scalar_one_or_none()
            
        if not user and email:
            stmt = select(User).where(User.email == email)
            result = await self.db.execute(stmt)
            user = result.scalar_one_or_none()

        # If user verified via Firebase for the first time, auto-provision
        if not user and email:
            org = await self.get_or_create_default_org()
            user = User(
                email=email,
                full_name=payload.get("name", email.split("@")[0]),
                role=payload.get("role", UserRole.CANDIDATE.value),
                organization_id=org.id,
                firebase_uid=payload.get("firebase_uid"),
                is_active=True
            )
            self.db.add(user)
            await self.db.flush()

            if user.role == UserRole.CANDIDATE.value:
                cand = Candidate(
                    user_id=user.id,
                    organization_id=org.id,
                    target_role="CloudOps Engineer"
                )
                self.db.add(cand)
                await self.db.flush()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found in system"
            )

        return user

    async def authenticate_firebase_phone(self, id_token: str, custom_name: Optional[str] = None, role: UserRole = UserRole.CANDIDATE) -> TokenResponse:
        from app.core.security import verify_firebase_id_token
        decoded = verify_firebase_id_token(id_token)
        
        firebase_uid = decoded.get("firebase_uid") or decoded.get("uid")
        phone_number = decoded.get("phone_number") or "+919876543210"
        email = decoded.get("email")
        
        # Search by firebase_uid or phone_number
        stmt = select(User).where((User.firebase_uid == firebase_uid) | (User.phone_number == phone_number))
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            org = await self.get_or_create_default_org()
            role_str = role.value if isinstance(role, UserRole) else str(role)
            name = custom_name or decoded.get("name") or f"Candidate {phone_number[-4:] if phone_number else 'User'}"
            
            user = User(
                email=email,
                phone_number=phone_number,
                full_name=name,
                role=role_str,
                organization_id=org.id,
                firebase_uid=firebase_uid,
                is_active=True
            )
            self.db.add(user)
            await self.db.flush()
            
            if role_str == UserRole.CANDIDATE.value:
                cand = Candidate(
                    user_id=user.id,
                    organization_id=org.id,
                    target_role="CloudOps Engineer",
                    experience_level="MID"
                )
                self.db.add(cand)
                await self.db.flush()
                
        token_data = {
            "sub": user.id,
            "phone_number": user.phone_number,
            "role": user.role,
            "organization_id": user.organization_id,
            "name": user.full_name
        }
        token = create_access_token(token_data)
        return TokenResponse(
            access_token=token,
            user=UserOut.model_validate(user)
        )
