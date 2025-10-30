import Config from '../config/config.js';
import Modeler from '../modeler/modeler.js';
import { createDishRoutes } from './controllers/dishController.js';

export default class Controller {
  constructor(app) {
    this.app = app;
    this.ERROR_CODES = new Config().getConfig().ERROR_CODES;
    this.modeler = new Modeler();
    this.models = this.modeler.getModels();
    this.special_plurals = this.modeler.getSpecialPlurals();
  }

  async init() {
    try {
      createDishRoutes(this.app);
      await this.createControllers(this.app, this.models);
    } catch (error) {
      console.log('Error initializing controllers:', error);
    }
  }

  async createControllers(app, models) {
    Object.values(models).forEach((model) => {
      if (!model) {
        throw new Error('Controller not found');
      }

      const table_name = model.modelName.toLowerCase();
      const table_names =
        this.special_plurals[model.modelName] || `${model.modelName}s`;

      const controllers = {
        get: [`/${table_names}`, `/${table_name}/:id`],
        post: [`/${table_name}`],
        put: [`/${table_name}/:id`],
        delete: [`/${table_name}/:id`, `/${table_names}/`],
      };

      const getId = (req) => req.params.id;

      const getData = async (method, req) => {
        switch (method) {
          case 'get':
            if (!req.params.id) {
              return await model.find();
            } else {
              return await model.findById(getId(req));
            }
          case 'post':
            const data = new model(req.body);
            await data.save();
            return data;
          case 'put':
            return await model.findByIdAndUpdate(getId(req), req.body, {
              new: true,
            });
          case 'delete':
            if (!req.params.id) {
              return await model.deleteMany({});
            } else {
              return await model.findByIdAndDelete(getId(req));
            }
          default:
            throw new Error('Method not supported');
        }
      };

      const handleError = (error, res) => {
        const status = this.ERROR_CODES.INTERNAL_SERVER_ERROR;
        res.status(status).json({ message: error.message, error });
        console.log(JSON.stringify(error, null, 2));
      };

      for (const method of Object.keys(controllers)) {
        for (const route of controllers[method]) {
          if (!route) {
            throw new Error(`Route for ${method} not found`);
          }

          app[method](route, async (req, res) => {
            try {
              const data = await getData(method, req);
              if (!data) {
                handleError(
                  new Error(
                    `No data found for ${model.modelName} and route ${route}`
                  ),
                  res
                );
                return;
              }
              res.json(data);
            } catch (error) {
              handleError(error, res);
            }
          });
        }
      }
    });
  }
}
