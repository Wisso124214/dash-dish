import config from "../config/config.js";
import { createDishRoutes } from "./controllers/dishController.js";
import { createAuthRoutes } from "./controllers/authController.js";
import express from "express";
import { RabbitPubSubService } from "../pubsub/rabbit.js";

export default class Controller {
  app: express.Express;
  pubsubService: RabbitPubSubService;
  ERROR_CODES: typeof config.ERROR_CODES = config.ERROR_CODES;

  constructor(app: express.Express, pubsubService: RabbitPubSubService) {
    this.app = app;
    this.pubsubService = pubsubService;
  }

  async init() {
    try {
      createDishRoutes(this.app, this.pubsubService);
      await createAuthRoutes(this.app);
    } catch (error) {
      console.log("Error initializing controllers:", error);
    }
  }
}
