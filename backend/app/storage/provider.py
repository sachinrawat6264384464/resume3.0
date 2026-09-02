from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class StorageProvider(ABC):
    @abstractmethod
    async def upload_file(
        self,
        file_bytes: bytes,
        file_name: str,
        org_id: str,
        candidate_id: str,
        attempt_id: str,
        mime_type: str = "video/webm"
    ) -> Dict[str, Any]:
        """
        Uploads recording file to storage provider.
        Returns metadata:
            {
                "storage_provider": str,
                "file_identifier": str, # file ID or local path
                "view_url": str,
                "file_size_bytes": int
            }
        """
        pass

    @abstractmethod
    async def get_download_or_view_url(self, file_identifier: str) -> Optional[str]:
        """Returns accessible secure URL for video playback."""
        pass

    @abstractmethod
    async def delete_file(self, file_identifier: str) -> bool:
        """Deletes file permanently from storage."""
        pass
