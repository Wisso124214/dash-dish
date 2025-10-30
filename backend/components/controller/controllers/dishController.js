import { Dish } from '../../modeler/models.js';

export const createDishRoutes = (app) => {
  // Buscar dish por id_api
  app.get('/dish/by-id-api/:id_api', async (req, res) => {
    try {
      const { id_api } = req.params;
      const dish = await Dish.findOne({ id_api });
      if (!dish) {
        return res.status(404).json({ message: 'Dish not found' });
      }
      res.json(dish);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  // Obtener platos con paginación (offset y limit)
  app.get('/dishes-pagination', async (req, res) => {
    try {
      const offset = parseInt(req.query.offset) || 0;
      const limit = parseInt(req.query.limit) || 10;
      const dishes = await Dish.find().skip(offset).limit(limit);
      res.status(200).json(dishes);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });
};
