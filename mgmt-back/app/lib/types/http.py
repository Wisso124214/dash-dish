from pydantic import BaseModel
from typing import Optional

class SessionData(BaseModel):
    email: str
    role: str
  
class LoginRequest(BaseModel):
    email: str
    password: str