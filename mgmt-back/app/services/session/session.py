import redis
import json
import uuid
import os
from typing import Optional, Dict, Any, cast
from app.lib.types.http import SessionData


class SessionService:
    def __init__(self):
        host = os.getenv('REDIS_HOST', 'redis')
        port = int(os.getenv('REDIS_PORT', 6379))
        password = os.getenv('REDIS_PASSWORD')
        db = int(os.getenv('REDIS_DB', 0))
        self.redis = redis.Redis(host=host, port=port, password=password, db=db, decode_responses=True)

    def create_session(self, data: SessionData, ttl: int = 3600) -> str:
        """Create a new session with the given data and TTL in seconds."""
        session_id = str(uuid.uuid4())
        self.redis.setex(f"session:{session_id}", ttl, data.model_dump_json())
        return session_id

    def get_session(self, session_id: str) -> Optional[SessionData]:
        """Retrieve session data by session ID."""
        data = self.redis.get(f"session:{session_id}")
        if data is None:
            return None
        data_str = cast(str, data)
        return SessionData.model_validate(json.loads(data_str))

    def delete_session(self, session_id: str) -> bool:
        """Delete a session by ID."""
        return bool(self.redis.delete(f"session:{session_id}"))

    def extend_session(self, session_id: str, ttl: int) -> bool:
        """Extend the TTL of a session."""
        key = f"session:{session_id}"
        if self.redis.exists(key):
            self.redis.expire(key, ttl)
            return True
        return False
