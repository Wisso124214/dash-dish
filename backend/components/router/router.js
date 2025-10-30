import { createUserRoutes } from './routes/userRoutes.js';
import { createNoteRoutes } from './routes/noteRoutes.js';

export default class Router {
  constructor(app) {
    this.app = app;
  }

  async init() {
    await this.createRoutes();

    this.app.get('/', (req, res) => {
      res.send('API is running...');
    });
  }

  async createRoutes() {
    await createUserRoutes(this.app);
    await createNoteRoutes(this.app);
  }
}
