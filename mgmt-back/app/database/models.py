from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


class DishExtra(BaseModel):
    name: str
    cost: float


class Dish(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    title: str
    description: Optional[str] = None
    cost_unit: float
    id_categories: Optional[List[str]] = None
    preview_image: Optional[str] = None
    extras: Optional[List[DishExtra]] = None


class OrderItem(BaseModel):
    id_dish: str
    quantity: int
    selected_extras: Optional[List[DishExtra]] = None


OrderStatus = Literal["preparing", "done", "delivered"]
OrderType = Literal["dinein", "delivery"]

class Order(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    id_user: str
    items: List[OrderItem]
    total_cost: float
    status: OrderStatus
    type: OrderType
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
    
class LDAPUser(BaseModel):
    email: str
    password: str
    role: Literal["admin", "register", "kitchen"]

