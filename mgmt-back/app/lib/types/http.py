from pydantic import BaseModel
from typing import Optional
from app.database.models import OrderStatus

class SessionData(BaseModel):
    email: str
    role: str
  
class LoginRequest(BaseModel):
    email: str
    password: str
    
class LoginResponse(BaseModel):
    session_id: str
    role: Optional[str] = None
    
class UpdateOrderStatusRequest(BaseModel):
    status: OrderStatus