import * as amqp from "amqplib";
import { CHANNELS, Channels } from "./channels.js";

function serializeJson(message: Record<string, any>): Buffer {
  return Buffer.from(JSON.stringify(message));
}

function deserializeJson(body: Buffer): Record<string, any> {
  return JSON.parse(body.toString());
}

export class RabbitPubSubService {
  private rabbitmqUrl: string;
  private connection: any = null;
  private channel: any = null;

  constructor(host: string, port: number, user: string, password: string) {
    this.rabbitmqUrl = `amqp://${user}:${password}@${host}:${port}/`;
  }

  async connect(retries: number = 10, interval: number = 3000): Promise<void> {

    const maxRetries =
      parseInt(process.env.RABBITMQ_CONNECT_RETRIES || String(retries)) ||
      retries;
    const retryInterval =
      parseInt(process.env.RABBITMQ_CONNECT_INTERVAL || String(interval)) ||
      interval;

    let attempt = 0;
    let lastError: Error | null = null;

    while (true) {
      try {
        attempt++;
        this.connection = await amqp.connect(this.rabbitmqUrl);
        this.channel = await this.connection.createChannel();

        // Declare all queues as durable
        for (const queueName of CHANNELS) {
          await this.channel.assertQueue(queueName, { durable: true });
        }

        console.log("Connected to RabbitMQ");
        return;
      } catch (error) {
        lastError = error as Error;
        if (attempt >= maxRetries) {
          console.error(
            `Failed to connect to RabbitMQ after ${attempt} attempts:`,
            lastError
          );
          throw lastError;
        }
        console.log(
          `RabbitMQ not ready (attempt ${attempt}/${maxRetries}), retrying in ${retryInterval}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }
  }

  async pub(queueName: Channels, message: Record<string, any>): Promise<void> {
    /**
     * Publish a message to a queue.
     */
    if (!this.channel) {
      await this.connect();
    }

    if (!this.channel) {
      throw new Error("Channel is not initialized");
    }

    const body = serializeJson(message);

    await this.channel.sendToQueue(queueName, body, {
      persistent: true,
    });
  }

  async close(): Promise<void> {
    /**
     * Close the RabbitMQ connection gracefully.
     */
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    console.log("RabbitMQ connection closed");
  }
}
