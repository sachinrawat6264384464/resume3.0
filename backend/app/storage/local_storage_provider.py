import os
import aiofiles
from typing import Dict, Any, Optional
from app.storage.provider import StorageProvider
from app.core.config import settings

class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = base_dir or settings.LOCAL_STORAGE_DIR
        os.makedirs(self.base_dir, exist_ok=True)

    async def upload_file(
        self,
        file_bytes: bytes,
        file_name: str,
        org_id: str,
        candidate_id: str,
        attempt_id: str,
        mime_type: str = "video/webm"
    ) -> Dict[str, Any]:
        target_dir = os.path.join(self.base_dir, org_id, candidate_id, attempt_id)
        os.makedirs(target_dir, exist_ok=True)
        
        target_path = os.path.join(target_dir, file_name)
        async with aiofiles.open(target_path, "wb") as f:
            await f.write(file_bytes)

        file_size = len(file_bytes)
        relative_path = os.path.relpath(target_path, self.base_dir)
        view_url = f"/api/v1/recordings/stream/{relative_path.replace(os.sep, '/')}"

        return {
            "storage_provider": "local",
            "file_identifier": target_path,
            "view_url": view_url,
            "file_size_bytes": file_size
        }

    async def get_download_or_view_url(self, file_identifier: str) -> Optional[str]:
        if os.path.exists(file_identifier):
            relative_path = os.path.relpath(file_identifier, self.base_dir)
            return f"/api/v1/recordings/stream/{relative_path.replace(os.sep, '/')}"
        return None

    async def delete_file(self, file_identifier: str) -> bool:
        if os.path.exists(file_identifier):
            try:
                os.remove(file_identifier)
                return True
            except OSError as e:
                print(f"Error removing local file {file_identifier}: {e}")
                return False
        return True # Idempotent deletion
