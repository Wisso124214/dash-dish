import pymongo
import bson
from .models import Dish, Order, OrderStatus, OrderType
from typing import Optional, Any
from datetime import datetime
import logging


class DBClient:
    def __init__(self, uri: str, db_name: str):
        self.client = pymongo.MongoClient(uri)
        self.db = self.client[db_name]

    def get_collection(self, collection_name: str):
        return self.db[collection_name]

    def create_order(self, order: Order):
        orders_collection = self.get_collection("orders")
        result = orders_collection.insert_one(order.model_dump(by_alias=True, exclude={'id'}))
        return str(result.inserted_id)

    def get_orders(
        self,
        status: Optional[OrderStatus] = None,
        type: Optional[OrderType] = None,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
    ):
        orders_collection = self.get_collection("orders")
        query: dict[str, Any] = {"status": status} if status else {}
        if from_date:
            query["created_at"] = {"$gte": from_date}
        if to_date:
            query["created_at"] = {"$lte": to_date}
            
        if type:
            query["type"] = type
        cursor = orders_collection.find(query)
        
        for doc in cursor:
            # convert top-level _id to string so Pydantic string fields validate correctly
            if "_id" in doc:
                try:
                    doc["_id"] = str(doc["_id"])
                except Exception:
                    # fallback: leave as-is if conversion fails
                    logging.warning(f"Failed to convert ObjectId to string: {doc['_id']}")
                    pass
            yield doc
    
    def get_order_by_id(self, order_id: str) -> Optional[Order]:
        orders_collection = self.get_collection("orders")
        data = orders_collection.find_one({"_id": bson.ObjectId(order_id)})
        if data:
            data["_id"] = str(data["_id"])
            return Order.model_validate(dict(data), by_alias=True)
        return None
      
    def update_order_status(self, order_id: str, new_status: OrderStatus):
        orders_collection = self.get_collection("orders")
        result = orders_collection.update_one(
            {"_id": bson.ObjectId(order_id)},
            {"$set": {"status": new_status, "updated_at": datetime.now()}}
        )
        return result.modified_count > 0
      
    def get_dishes(self):
        dishes_collection = self.get_collection("dishes")
        # Return an iterator of dicts where ObjectId values are converted to strings
        cursor = dishes_collection.find()
        for doc in cursor:
            # convert top-level _id to string so Pydantic string fields validate correctly
            logging.info(f"Processing dish document: {doc}")
            if "_id" in doc:
                try:
                    doc["_id"] = str(doc["_id"])
                except Exception:
                    # fallback: leave as-is if conversion fails
                    logging.warning(f"Failed to convert ObjectId to string: {doc['_id']}")
                    pass
            yield doc
            
    def get_dish_by_id(self, dish_id: str) -> Optional[Dish]:
        dishes_collection = self.get_collection("dishes")
        data = dishes_collection.find_one({"_id": bson.ObjectId(dish_id)})
        if data:
            data["_id"] = str(data["_id"])
            return Dish.model_validate(dict(data), by_alias=True)
        return None
      
    
