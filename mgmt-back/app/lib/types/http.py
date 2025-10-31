from pydantic import BaseModel
from typing import Optional

class SessionData(BaseModel):
    email: str
    role: str
  
class LoginRequest(BaseModel):
    email: str
    password: str
    
class LoginResponse(BaseModel):
    session_id: str
    role: Optional[str] = None