import { Dish, Order } from "../../database/models";
import { createOrderSchema } from "../../database/schemas";
import e from "express";
import { getSession } from "../../session/sessionManager";
import { RabbitPubSubService } from "../../pubsub/rabbit.js";

export const createDishRoutes = (
  app: e.Express,
  pubsubService: RabbitPubSubService
) => {
  // Buscar dish por id
  app.get("/dishes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const dish = await Dish.findOne({ id });
      if (!dish) {
        return res.status(404).json({ message: "Dish not found" });
      }
      res.json(dish);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Obtener platos con paginación (offset y limit)
  app.get("/dishes", async (req, res) => {
    try {
      const offset = parseInt(String(req.query?.offset ?? "0"));
      const limit = parseInt(String(req.query?.limit ?? "10"));
      const dishes = await Dish.find().skip(offset).limit(limit);
      res.status(200).json(dishes);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Create order
  app.post("/orders", async (req, res) => {
    try {
      // Validate request body with zod
      const validationResult = createOrderSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Error de validación",
          errors: validationResult.error,
        });
      }

      const { items, type } = validationResult.data;

      // Get user from session
      const sessionData = getSession(req);
      console.log("Session data:", sessionData);
      if (!sessionData.username) {
        return res.status(401).json({ message: "No estas autenticado" });
      }

      // Calculate total cost
      let total_cost = 0;
      for (const item of items) {
        const dish = await Dish.findById(item.id_dish);
        if (!dish) {
          return res.status(404).json({
            message: `Dish not found: ${item.id_dish}`,
          });
        }

        let itemCost = dish.cost_unit * item.quantity;

        // Add extras cost
        if (item.selected_extras) {
          const extrasCost = item.selected_extras.reduce(
            (sum, extra) => sum + extra.cost,
            0
          );
          itemCost += extrasCost * item.quantity;
        }

        total_cost += itemCost;
      }

      // Create order
      const order = new Order({
        id_user: sessionData.username,
        items,
        total_cost,
        status: "preparing",
        type,
        created_at: new Date(),
      });

      await order.save();

      // Publish order creation event to RabbitMQ
      await pubsubService.pub("orders:new", {
        _id: order._id.toString(),
        id_user: order.id_user,
        items: order.items,
        total_cost: order.total_cost,
        status: order.status,
        type: order.type,
        created_at: order.created_at,
      });

      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Server error", error });
    }
  });
};
