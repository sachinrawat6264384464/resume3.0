from datetime import datetime, timezone
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.recording import Recording
from app.models.audit_log import AuditLog
from app.storage import get_storage_provider
from app.schemas.admin import RetentionCleanupResponse

class RetentionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.storage = get_storage_provider()

    async def cleanup_expired_recordings(self) -> RetentionCleanupResponse:
        now = datetime.now(timezone.utc)
        
        # Select active recordings that have passed expiration date
        stmt = (
            select(Recording)
            .where(
                and_(
                    Recording.expires_at <= now,
                    Recording.deleted_at.is_(None),
                    Recording.deletion_status != "RETENTION_PURGED"
                )
            )
        )
        result = await self.db.execute(stmt)
        expired_recs = result.scalars().all()

        scanned = len(expired_recs)
        purged = 0
        freed_bytes = 0

        for rec in expired_recs:
            file_id_or_path = rec.google_drive_file_id or rec.local_file_path
            if file_id_or_path:
                deleted = await self.storage.delete_file(file_id_or_path)
                if deleted:
                    freed_bytes += rec.file_size_bytes
            
            rec.deleted_at = now
            rec.deletion_status = "RETENTION_PURGED"
            purged += 1

            # Log audit event
            audit = AuditLog(
                organization_id="default",
                action="RETENTION_CLEANUP_PURGE",
                entity_type="recording",
                entity_id=rec.id,
                details={
                    "file_name": rec.file_name,
                    "storage_provider": rec.storage_provider,
                    "file_size_bytes": rec.file_size_bytes,
                    "expires_at": rec.expires_at.isoformat()
                }
            )
            self.db.add(audit)

        await self.db.flush()

        return RetentionCleanupResponse(
            scanned_count=scanned,
            expired_count=scanned,
            purged_count=purged,
            freed_bytes=freed_bytes,
            status="SUCCESS",
            cleaned_at=now
        )
