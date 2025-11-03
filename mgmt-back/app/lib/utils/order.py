from app.database.models import Order, OrderItem
from app.database.mongo import DBClient
def get_dish_cost(dish_id: str, db_client: DBClient):
    dish = db_client.get_dish_by_id(dish_id)
    return dish.cost_unit if dish else 0

def order_from_items(items: list[OrderItem], db_client: DBClient) -> Order:
    total_cost = sum(
        item.quantity * (
            get_dish_cost(item.id_dish, db_client) +
            sum(extra.cost for extra in (item.selected_extras or []))
        )
        for item in items
    )
    return Order(
        _id=None,
        id_user="",
        items=items,
        total_cost=total_cost,
        status="preparing",
        type="dinein"
    )