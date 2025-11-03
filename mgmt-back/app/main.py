import json
from fastapi import FastAPI, HTTPException, Header, Depends, Query, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from datetime import datetime
import os
from dotenv import load_dotenv
import asyncio

from app.database.mongo import DBClient
from app.services.auth.auth import AuthService
from app.services.pubsub.rabbit import RabbitPubSubService
from app.services.ws.connection_manager import ConnectionManager
from app.lib.utils.order import order_from_items
from app.database.models import OrderStatus, OrderType, Order, Dish, OrderItem
from app.lib.types.http import LoginRequest, LoginResponse, SessionData

load_dotenv()



# Initialize services
mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
mongo_db_name = os.getenv("MONGODB_DB_NAME", "deliveries_db")
db_client = DBClient(mongo_uri, mongo_db_name)
pubsub = RabbitPubSubService(
    host=os.getenv("RABBITMQ_HOST", "rabbitmq"),
    port=int(os.getenv("RABBITMQ_PORT", 5672)),
    user=os.getenv("RABBITMQ_USER", "admin"),
    password=os.getenv("RABBITMQ_PASSWORD", "admin")
)
auth_service = AuthService()
manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await pubsub.connect()
    asyncio.create_task(subscribe_to_orders())
    yield

app = FastAPI(title="DashDish Management API", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def subscribe_to_orders():
    async def order_callback(message: dict):
        await manager.broadcast(json.dumps(message))

    await pubsub.sub("orders:new", order_callback)
    await pubsub.sub("orders:updated", order_callback)

# Dependency to check session
def get_current_user(session_id: str = Header(..., alias="session-id")):
    user = auth_service.get_current_user(session_id)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    return user

@app.post("/login")
def login(request: LoginRequest, response_model=LoginResponse):
    login_response = auth_service.login(request.email, request.password)
    if not login_response:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return login_response

@app.get("/orders", response_model=List[Order])
async def get_orders(
    status: Optional[OrderStatus] = None,
    type: Optional[OrderType] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    current_user: SessionData = Depends(get_current_user)
):
    orders = list(db_client.get_orders(status=status, type=type, from_date=from_date, to_date=to_date))
    result = []
    for order in orders:
        order_dict = dict(order)
        result.append(Order.model_validate(order_dict, by_alias=True))
    return result

@app.post("/orders", response_model=Order)
async def create_order(items: List[OrderItem], current_user: SessionData = Depends(get_current_user)):
    order = order_from_items(items, db_client)
    order_id = db_client.create_order(order)
    order.id = order_id
    
    await pubsub.pub("orders:new", order.model_dump(mode='json', by_alias=True))
    return order

@app.put("/orders/{order_id}/status", response_model=Order)
async def update_order_status(order_id: str, new_status: OrderStatus, current_user: SessionData = Depends(get_current_user)):
    success = db_client.update_order_status(order_id, new_status)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    order = db_client.get_order_by_id(order_id)
    if order:
        await pubsub.pub("orders:updated", order.model_dump(mode='json'))
        return order
    raise HTTPException(status_code=404, detail="Order not found")

@app.get("/dishes", response_model=List[Dish])
async def get_dishes(current_user: dict = Depends(get_current_user)):
    dishes = list(db_client.get_dishes())
    result = []
    for dish in dishes:
        dish_dict = dict(dish)
        result.append(Dish.model_validate(dish_dict, by_alias=True))
    return result

@app.websocket("/ws/orders")
async def websocket_endpoint(websocket: WebSocket):
    # Extract session-id from query params
    session_id = websocket.query_params.get("session-id")
    
    if not session_id:
        await websocket.close(code=1008, reason="Missing session-id")
        return
    
    current_user = auth_service.get_current_user(session_id)
    if not current_user:
        await websocket.close(code=1008, reason="Invalid or expired session")
        return
    
    # Accept connection
    await manager.connect(websocket)
    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
