import time
from typing import Any, Dict, Optional, Tuple

class SimpleTTLCache:
    def __init__(self, default_ttl: int = 60):
        self._cache: Dict[str, Tuple[float, Any]] = {}
        self.default_ttl = default_ttl

    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            ts, val = self._cache[key]
            if time.time() - ts < self.default_ttl:
                return val
            else:
                del self._cache[key]
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        self._cache[key] = (time.time(), value)

    def invalidate(self, prefix: Optional[str] = None):
        if prefix is None:
            self._cache.clear()
        else:
            keys_to_del = [k for k in self._cache if k.startswith(prefix)]
            for k in keys_to_del:
                del self._cache[k]

admin_ttl_cache = SimpleTTLCache(default_ttl=60)
