import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import cors from "cors";
import Controller from "./components/controller/controller.js";
import "dotenv/config.js";
import { Database } from "./components/database/mongo.js";
import { RabbitPubSubService } from "./components/pubsub/rabbit.js";

async function main() {
  const app = express();

  // Connect to MongoDB
  await new Database().connect(process.env.DB_URL!);

  // Initialize RabbitMQ service
  const pubsubService = new RabbitPubSubService(
    process.env.RABBITMQ_HOST || "rabbitmq",
    parseInt(process.env.RABBITMQ_PORT || "5672"),
    process.env.RABBITMQ_USER || "admin",
    process.env.RABBITMQ_PASSWORD || "admin"
  );

  // Connect to RabbitMQ
  await pubsubService.connect();

  // CORS configuration - allow multiple origins
  const allowedOrigins = [
    process.env.FRONTEND_LOCAL_URL,
    process.env.FRONTEND_URL,
    "http://localhost:8080", // Add the reverse proxy URL
  ].filter(Boolean); // Remove any undefined values

  app.use(
    cors({
      origin: function (origin, callback) {
        console.log("CORS Request - Origin:", origin);
        console.log("Allowed Origins:", allowedOrigins);

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
          console.log("No origin provided, allowing request");
          return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) !== -1) {
          console.log("Origin allowed:", origin);
          callback(null, true);
        } else {
          console.log("Origin NOT allowed:", origin);
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );

  app.use(bodyParser.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: false,
      saveUninitialized: false,
    })
  );

  const controller = new Controller(app, pubsubService);
  await controller.init();

  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server running on port ${process.env.PORT || 8000}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.log(err);
});

// Note: Graceful shutdown would require passing pubsubService reference
// or implementing a cleanup registry pattern
