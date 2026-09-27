import json
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc

from app.core.database import get_db
from app.core.security import verify_auth_token
from app.models.walkthrough_video import WalkthroughVideo
from app.storage import get_storage_provider
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/walkthrough-videos", tags=["Walkthrough Videos & Cloudinary Showcase"])

@router.get("", response_model=StandardResponse[List[dict]])
async def list_walkthrough_videos(db: AsyncSession = Depends(get_db)):
    stmt = select(WalkthroughVideo).order_by(WalkthroughVideo.created_at.desc())
    res = await db.execute(stmt)
    videos = res.scalars().all()

    video_list = []
    for v in videos:
        features = v.key_features
        if isinstance(features, str):
            try:
                features = json.loads(features)
            except Exception:
                features = [features]
        
        video_list.append({
            "id": v.id,
            "category": v.category,
            "title": v.title,
            "tagline": v.tagline or "",
            "description": v.description,
            "cloudinary_url": v.cloudinary_url,
            "videoUrl": v.cloudinary_url, # Compatible field
            "cloudinary_public_id": v.cloudinary_public_id,
            "audio_enabled": v.audio_enabled,
            "audioEnabled": v.audio_enabled,
            "key_features": features or [],
            "keyFeatures": features or [],
            "mock_route": v.mock_route or "/dashboard",
            "mockRoute": v.mock_route or "/dashboard",
            "created_at": v.created_at.isoformat() if v.created_at else None
        })

    return StandardResponse(
        message="Fetched walkthrough videos from PostgreSQL DB",
        data=video_list
    )

@router.post("/upload", response_model=StandardResponse[dict])
async def upload_walkthrough_video(
    file: Optional[UploadFile] = File(None),
    category: str = Form("All Project Overview"),
    title: str = Form(...),
    tagline: Optional[str] = Form(""),
    description: str = Form(...),
    audio_enabled: bool = Form(True),
    key_features: Optional[str] = Form(""),
    mock_route: Optional[str] = Form("/dashboard"),
    existing_video_url: Optional[str] = Form(None),
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    storage = get_storage_provider()
    cloudinary_url = existing_video_url
    public_id = None
    file_size = "0 MB"

    if file:
        file_bytes = await file.read()
        file_size = f"{(len(file_bytes) / (1024 * 1024)):.2f} MB"
        
        # 1. UPLOAD FILE TO CLOUDINARY
        upload_result = await storage.upload_file(
            file_bytes=file_bytes,
            file_name=file.filename or "walkthrough_video.mp4",
            org_id="cloudops",
            candidate_id="admin_videos",
            attempt_id="showcase",
            mime_type=file.content_type or "video/mp4"
        )
        
        cloudinary_url = upload_result.get("view_url") or upload_result.get("file_identifier")
        public_id = upload_result.get("file_identifier")

    if not cloudinary_url:
        cloudinary_url = "/vedio/candidate-dashboard.mp4"

    # Parse key features
    features_list = []
    if key_features:
        try:
            features_list = json.loads(key_features)
        except Exception:
            features_list = [f.strip() for f in key_features.split("\n") if f.strip()]

    # 2. SAVE TO POSTGRESQL NEON DATABASE
    new_video = WalkthroughVideo(
        category=category,
        title=title,
        tagline=tagline,
        description=description,
        cloudinary_url=cloudinary_url,
        cloudinary_public_id=public_id,
        audio_enabled=audio_enabled,
        key_features=features_list,
        mock_route=mock_route or "/dashboard",
        file_size_bytes=file_size
    )

    db.add(new_video)
    await db.commit()
    await db.refresh(new_video)

    return StandardResponse(
        message="Video uploaded to Cloudinary & saved to PostgreSQL DB successfully!",
        data={
            "id": new_video.id,
            "category": new_video.category,
            "title": new_video.title,
            "tagline": new_video.tagline,
            "description": new_video.description,
            "cloudinary_url": new_video.cloudinary_url,
            "videoUrl": new_video.cloudinary_url,
            "audio_enabled": new_video.audio_enabled,
            "audioEnabled": new_video.audio_enabled,
            "key_features": new_video.key_features,
            "keyFeatures": new_video.key_features,
            "mock_route": new_video.mock_route,
            "mockRoute": new_video.mock_route
        }
    )

@router.delete("/{video_id}", response_model=StandardResponse[dict])
async def delete_walkthrough_video(
    video_id: str,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(WalkthroughVideo).where(WalkthroughVideo.id == video_id)
    res = await db.execute(stmt)
    v = res.scalar_one_or_none()
    
    if not v:
        raise HTTPException(status_code=404, detail="Walkthrough video not found")

    # Destroy in Cloudinary if public_id exists
    if v.cloudinary_public_id:
        try:
            storage = get_storage_provider()
            await storage.delete_file(v.cloudinary_public_id)
        except Exception as e:
            print("Cloudinary deletion notice:", e)

    await db.delete(v)
    await db.commit()

    return StandardResponse(
        message="Video deleted from Cloudinary & PostgreSQL DB",
        data={"id": video_id}
    )
