from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.api.router import api_router
from app.seeds.initial_data import seed_database
from app.services.retention_service import RetentionService

# Background scheduler for 90-day recording retention cleanup
scheduler = AsyncIOScheduler()

async def scheduled_retention_job():
    print("[Retention Scheduler] Running periodic 90-day recording expiration cleaner...")
    async with AsyncSessionLocal() as session:
        retention_svc = RetentionService(session)
        result = await retention_svc.cleanup_expired_recordings()
        if result.purged_count > 0:
            print(f"[Retention Scheduler] Purged {result.purged_count} expired recordings ({result.freed_bytes} bytes freed).")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist & seed initial CloudOps data
    print(f"Starting {settings.PROJECT_NAME} in {settings.ENVIRONMENT} mode...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    try:
        await seed_database()
    except Exception as e:
        print(f"Seed check error (may already be seeded): {e}")

    # Start scheduled cleanup job (runs every 24 hours in production; set to run periodically)
    scheduler.add_job(scheduled_retention_job, 'interval', hours=24, id="recording_retention_cleaner")
    scheduler.start()
    
    yield

    # Shutdown
    scheduler.shutdown()
    await engine.dispose()
    print("Application shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade AI-Powered CloudOps & DevOps Interview and Assessment Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://resume3-0.vercel.app",
        "https://resume3-admin.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3006",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3006"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app|http://(localhost|127\.0\.0\.1):[0-9]+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Performance & Timing Telemetry Middleware
import time

@app.middleware("http")
async def add_performance_telemetry_middleware(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
    response.headers["X-Process-Time"] = f"{process_time_ms}ms"

    if process_time_ms > 300:
        print(f"⚠️ [SLOW API WARNING] {request.method} {request.url.path} | Status: {response.status_code} | Time: {process_time_ms}ms")
    else:
        print(f"⚡ [API PERFORMANCE] {request.method} {request.url.path} | Status: {response.status_code} | Time: {process_time_ms}ms")

    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled Exception on {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected server error occurred. Please contact the administrator.",
            "error_detail": str(exc) if settings.DEBUG else None
        }
    )

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.api_route("/", methods=["GET", "HEAD"], tags=["Health"])
async def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs"
    }

@app.api_route("/health", methods=["GET", "HEAD"], tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_provider": settings.AI_PROVIDER,
        "stt_provider": settings.STT_PROVIDER,
        "storage_provider": settings.STORAGE_PROVIDER
    }
