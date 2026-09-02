import io
import os
from typing import Dict, Any, Optional
from app.storage.provider import StorageProvider
from app.storage.local_storage_provider import LocalStorageProvider
from app.core.config import settings

class GoogleDriveStorageProvider(StorageProvider):
    """
    Google Drive Storage Provider for storing candidate interview video chunks.
    Implements structured folder hierarchy:
      AI Interview Platform -> Organization -> Candidate -> Attempt -> Question Recording
    """
    def __init__(self):
        self.fallback = LocalStorageProvider()
        self._service = None
        self._root_folder_id = settings.GOOGLE_DRIVE_FOLDER_ID
        self._init_service()

    def _init_service(self):
        if settings.GOOGLE_DRIVE_SERVICE_ACCOUNT_FILE and os.path.exists(settings.GOOGLE_DRIVE_SERVICE_ACCOUNT_FILE):
            try:
                from google.oauth2 import service_account
                from googleapiclient.discovery import build
                creds = service_account.Credentials.from_service_account_file(
                    settings.GOOGLE_DRIVE_SERVICE_ACCOUNT_FILE,
                    scopes=['https://www.googleapis.com/auth/drive.file']
                )
                self._service = build('drive', 'v3', credentials=creds)
            except Exception as e:
                print(f"Warning: Failed to initialize Google Drive service ({e}), using local storage fallback.")

    async def _get_or_create_folder(self, folder_name: str, parent_id: Optional[str] = None) -> Optional[str]:
        if not self._service:
            return None
        try:
            query = f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
            if parent_id:
                query += f" and '{parent_id}' in parents"
            
            results = self._service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
            items = results.get('files', [])
            if items:
                return items[0]['id']

            file_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder'
            }
            if parent_id:
                file_metadata['parents'] = [parent_id]

            folder = self._service.files().create(body=file_metadata, fields='id').execute()
            return folder.get('id')
        except Exception as e:
            print(f"Google Drive folder creation error: {e}")
            return None

    async def upload_file(
        self,
        file_bytes: bytes,
        file_name: str,
        org_id: str,
        candidate_id: str,
        attempt_id: str,
        mime_type: str = "video/webm"
    ) -> Dict[str, Any]:
        if not self._service:
            return await self.fallback.upload_file(file_bytes, file_name, org_id, candidate_id, attempt_id, mime_type)

        try:
            from googleapiclient.http import MediaIoBaseUpload
            
            # Build hierarchy: root -> org -> candidate -> attempt
            org_folder_id = await self._get_or_create_folder(f"Org_{org_id}", self._root_folder_id)
            cand_folder_id = await self._get_or_create_folder(f"Cand_{candidate_id}", org_folder_id)
            attempt_folder_id = await self._get_or_create_folder(f"Attempt_{attempt_id}", cand_folder_id)

            file_metadata = {'name': file_name}
            if attempt_folder_id:
                file_metadata['parents'] = [attempt_folder_id]

            media = MediaIoBaseUpload(io.BytesIO(file_bytes), mimetype=mime_type, resumable=True)
            file = self._service.files().create(body=file_metadata, media_body=media, fields='id, webViewLink, size').execute()
            
            file_id = file.get('id')
            view_url = file.get('webViewLink', f"https://drive.google.com/file/d/{file_id}/view")
            
            return {
                "storage_provider": "google_drive",
                "file_identifier": file_id,
                "view_url": view_url,
                "file_size_bytes": len(file_bytes)
            }
        except Exception as e:
            print(f"Google Drive upload failed ({e}), falling back to local storage.")
            return await self.fallback.upload_file(file_bytes, file_name, org_id, candidate_id, attempt_id, mime_type)

    async def get_download_or_view_url(self, file_identifier: str) -> Optional[str]:
        if not self._service or "/" in file_identifier:
            return await self.fallback.get_download_or_view_url(file_identifier)
        return f"https://drive.google.com/file/d/{file_identifier}/view"

    async def delete_file(self, file_identifier: str) -> bool:
        if not self._service or "/" in file_identifier:
            return await self.fallback.delete_file(file_identifier)
        try:
            self._service.files().delete(fileId=file_identifier).execute()
            return True
        except Exception as e:
            print(f"Google drive file deletion error ({e})")
            return False
