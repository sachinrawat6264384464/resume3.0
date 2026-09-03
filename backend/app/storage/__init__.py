from app.storage.provider import StorageProvider
from app.storage.local_storage_provider import LocalStorageProvider
from app.storage.google_drive_provider import GoogleDriveStorageProvider
from app.storage.cloudinary_provider import CloudinaryStorageProvider
from app.core.config import settings

def get_storage_provider() -> StorageProvider:
    provider_name = settings.STORAGE_PROVIDER.lower()
    if provider_name in ("gdrive", "google_drive", "drive"):
        return GoogleDriveStorageProvider()
    elif provider_name in ("cloudinary", "cloud"):
        return CloudinaryStorageProvider()
    return LocalStorageProvider()

__all__ = ["StorageProvider", "LocalStorageProvider", "GoogleDriveStorageProvider", "CloudinaryStorageProvider", "get_storage_provider"]
