import os
import asyncio
from typing import Dict, Any, Optional
from app.storage.provider import StorageProvider
from app.storage.local_storage_provider import LocalStorageProvider
from app.core.config import settings

class CloudinaryStorageProvider(StorageProvider):
    def __init__(self):
        self.fallback = LocalStorageProvider()
        self.initialized = False

        cloud_name = settings.CLOUDINARY_CLOUD_NAME
        api_key = settings.CLOUDINARY_API_KEY
        api_secret = settings.CLOUDINARY_API_SECRET
        cloudinary_url = settings.CLOUDINARY_URL

        if (cloud_name and api_key and api_secret) or cloudinary_url:
            try:
                import cloudinary
                import cloudinary.uploader

                if cloudinary_url:
                    os.environ["CLOUDINARY_URL"] = cloudinary_url
                else:
                    cloudinary.config(
                        cloud_name=cloud_name,
                        api_key=api_key,
                        api_secret=api_secret,
                        secure=True
                    )
                self.initialized = True
            except Exception as e:
                print(f"Warning: Cloudinary initialization failed ({e}), falling back to local storage.")

    async def upload_file(
        self,
        file_bytes: bytes,
        file_name: str,
        org_id: str = "default",
        candidate_id: str = "general",
        attempt_id: str = "resumes",
        mime_type: str = "application/pdf"
    ) -> Dict[str, Any]:
        if not self.initialized:
            return await self.fallback.upload_file(file_bytes, file_name, org_id, candidate_id, attempt_id, mime_type)

        try:
            import cloudinary.uploader

            resource_type = "image"
            if mime_type.startswith("video/") or file_name.endswith((".webm", ".mp4", ".mkv")):
                resource_type = "video"
            elif mime_type.startswith("audio/") or file_name.endswith((".mp3", ".wav", ".m4a")):
                resource_type = "video" # Cloudinary handles audio as video resource type
            elif mime_type == "application/pdf" or file_name.endswith((".pdf", ".docx", ".doc", ".txt")):
                resource_type = "raw"

            folder_path = f"cloudops/{org_id}/{candidate_id}"

            def _upload():
                return cloudinary.uploader.upload(
                    file_bytes,
                    folder=folder_path,
                    public_id=file_name.rsplit(".", 1)[0],
                    resource_type=resource_type,
                    overwrite=True
                )

            res = await asyncio.to_thread(_upload)

            secure_url = res.get("secure_url") or res.get("url")
            public_id = res.get("public_id")

            return {
                "storage_provider": "cloudinary",
                "file_identifier": public_id,
                "view_url": secure_url,
                "file_size_bytes": len(file_bytes),
                "resource_type": resource_type
            }
        except Exception as e:
            print(f"Cloudinary upload error ({e}), falling back to local storage.")
            return await self.fallback.upload_file(file_bytes, file_name, org_id, candidate_id, attempt_id, mime_type)

    async def get_download_or_view_url(self, file_identifier: str) -> Optional[str]:
        if file_identifier.startswith("http://") or file_identifier.startswith("https://"):
            return file_identifier
        return await self.fallback.get_download_or_view_url(file_identifier)

    async def delete_file(self, file_identifier: str) -> bool:
        if not self.initialized:
            return await self.fallback.delete_file(file_identifier)
        try:
            import cloudinary.uploader
            def _delete():
                return cloudinary.uploader.destroy(file_identifier)
            res = await asyncio.to_thread(_delete)
            return res.get("result") == "ok"
        except Exception as e:
            print(f"Cloudinary deletion failed ({e})")
            return await self.fallback.delete_file(file_identifier)
