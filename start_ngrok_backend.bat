@echo off
echo ===================================================
echo   CLOUDOPS AI - LOCAL BACKEND & NGROK TUNNEL LAUNCHER
echo ===================================================

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "FastAPI Backend" cmd /k "cd /d d:\AI_Interview3.0\backend && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 >nul

echo [2/2] Starting ngrok Public Tunnel for Port 8000 ...
start "ngrok Tunnel" cmd /k "ngrok http 127.0.0.1:8000"

echo.
echo ===================================================
echo   SETUP COMPLETE! 
echo   Backend is running on http://127.0.0.1:8000
echo   ngrok tunnel active on https://handcuff-dweller-crimp.ngrok-free.dev
echo ===================================================
pause
