import os
import json
import time
from datetime import datetime
from typing import Dict, List, Any

LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs")
LOG_FILE = os.path.join(LOG_DIR, "api_performance.log")

def ensure_log_dir():
    if not os.path.exists(LOG_DIR):
        os.makedirs(LOG_DIR, exist_ok=True)

def log_api_telemetry(method: str, path: str, status_code: int, process_time_ms: float, client_ip: str = "127.0.0.1"):
    """
    Appends a structured JSON log entry for every HTTP request into backend/logs/api_performance.log
    """
    ensure_log_dir()
    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "method": method,
        "path": path,
        "status_code": status_code,
        "process_time_ms": round(process_time_ms, 2),
        "client_ip": client_ip,
        "is_slow": process_time_ms > 300.0
    }
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception as e:
        print(f"Failed to write API telemetry log: {e}")

def analyze_api_performance_logs(limit: int = 500) -> Dict[str, Any]:
    """
    Parses stored API performance logs and calculates bottleneck analytics.
    Returns:
      - total_requests
      - overall_avg_ms
      - slow_requests_count (>300ms)
      - endpoint_stats: summary per route (count, avg_ms, min_ms, max_ms)
      - top_slowest_requests: top 10 slowest request entries
    """
    ensure_log_dir()
    if not os.path.exists(LOG_FILE):
        return {
            "status": "empty",
            "message": "No log file found yet. Make some API requests to record telemetry.",
            "total_requests": 0,
            "overall_avg_ms": 0.0,
            "slow_requests_count": 0,
            "endpoint_stats": {},
            "top_slowest_requests": []
        }

    entries: List[Dict[str, Any]] = []
    try:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()[-limit:]
            for line in lines:
                line = line.strip()
                if line:
                    try:
                        entries.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue
    except Exception as e:
        return {"status": "error", "error": str(e)}

    if not entries:
        return {
            "status": "empty",
            "total_requests": 0,
            "overall_avg_ms": 0.0,
            "slow_requests_count": 0,
            "endpoint_stats": {},
            "top_slowest_requests": []
        }

    total_requests = len(entries)
    total_time_ms = sum(e["process_time_ms"] for e in entries)
    overall_avg_ms = round(total_time_ms / total_requests, 2)
    slow_requests = [e for e in entries if e.get("is_slow", False)]

    # Group stats by endpoint path
    endpoint_data: Dict[str, List[float]] = {}
    for e in entries:
        p = e["path"]
        if p not in endpoint_data:
            endpoint_data[p] = []
        endpoint_data[p].append(e["process_time_ms"])

    endpoint_stats = {}
    for p, times in endpoint_data.items():
        endpoint_stats[p] = {
            "count": len(times),
            "avg_ms": round(sum(times) / len(times), 2),
            "min_ms": round(min(times), 2),
            "max_ms": round(max(times), 2)
        }

    # Top 10 slowest requests
    sorted_slowest = sorted(entries, key=lambda x: x["process_time_ms"], reverse=True)[:10]

    return {
        "status": "success",
        "total_requests": total_requests,
        "overall_avg_ms": overall_avg_ms,
        "slow_requests_count": len(slow_requests),
        "endpoint_stats": endpoint_stats,
        "top_slowest_requests": sorted_slowest
    }
