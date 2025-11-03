import type { DishExtra } from "./dish.js";

/**
 * 
 * class OrderItem(BaseModel):
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
   
 */

export type OrderStatus = 'preparing' | 'done' | 'delivered';
export type OrderType = 'dinein' | 'delivery';

export interface OrderItem {
  id_dish: string;
  quantity: number;
  selected_extras?: DishExtra[];
}

export interface Order {
  _id?: string;
  id_user: string;
  items: OrderItem[];
  total_cost: number;
  status: OrderStatus;
  type: OrderType;
  created_at: string;
  updated_at?: string;
}

