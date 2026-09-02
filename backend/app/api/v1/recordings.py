import os
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
from app.core.config import settings

router = APIRouter(prefix="/recordings", tags=["Recordings"])

@router.get("/stream/{file_path:path}")
async def stream_local_recording(file_path: str):
    full_path = os.path.join(settings.LOCAL_STORAGE_DIR, file_path)
    # Prevent directory traversal
    real_base = os.path.realpath(settings.LOCAL_STORAGE_DIR)
    real_target = os.path.realpath(full_path)
    if not real_target.startswith(real_base) or not os.path.exists(real_target):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recording file not found")

    return FileResponse(
        path=real_target,
        media_type="video/webm",
        filename=os.path.basename(real_target)
    )
