import pymongo
from .models import Dish, Order, OrderStatus, OrderType
from typing import Optional
from datetime import datetime


class DBClient:
    def __init__(self, uri: str, db_name: str):
        self.client = pymongo.MongoClient(uri)
        self.db = self.client[db_name]

    def get_collection(self, collection_name: str):
        return self.db[collection_name]

    def create_order(self, order: Order):
        orders_collection = self.get_collection("orders")
        result = orders_collection.insert_one(order.dict(by_alias=True))
        return str(result.inserted_id)

    def get_orders(
        self,
        status: Optional[OrderStatus] = None,
        type: Optional[OrderType] = None,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
    ):
        orders_collection = self.get_collection("orders")
        query = {"status": status} if status else {}
        if from_date:
            query["created_at"] = {"$gte": from_date}
        if to_date:
            query["created_at"] = {"$lte": to_date}
        return orders_collection.find(query)
      
    def update_order_status(self, order_id: str, new_status: OrderStatus):
        orders_collection = self.get_collection("orders")
        result = orders_collection.update_one(
            {"_id": pymongo.ObjectId(order_id)},
            {"$set": {"status": new_status, "updated_at": datetime.now()}}
        )
        return result.modified_count > 0
      
    def get_dishes(self):
        dishes_collection = self.get_collection("dishes")
        return dishes_collection.find()
      
    
