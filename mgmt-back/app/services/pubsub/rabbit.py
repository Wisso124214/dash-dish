import aio_pika
import asyncio
import os
from typing import Callable, Coroutine, Any
import json
from .channels import CHANNELS, Channels

def serialize_json(message: dict) -> bytes:
    return json.dumps(message).encode('utf-8')

def deserialize_json(body: bytes) -> dict:
    return json.loads(body.decode('utf-8'))

class RabbitPubSubService:
    def __init__(self, host: str, port: int, user: str, password: str):
        self.rabbitmq_url = f"amqp://{user}:{password}@{host}:{port}/"
        self.connection = None
        self.channel = None

    async def connect(self, retries: int | None = None, interval: float | None = None):
        """Connect to RabbitMQ and declare queues.

        This method will retry a few times (configurable) before raising so
        that the app can tolerate RabbitMQ starting a bit slower than this
        service.
        """
        # Allow configuration via env vars; defaults: 10 attempts, 3s interval
        if retries is None:
            try:
                retries = int(os.getenv("RABBITMQ_CONNECT_RETRIES", "10"))
            except Exception:
                retries = 10
        if interval is None:
            try:
                interval = float(os.getenv("RABBITMQ_CONNECT_INTERVAL", "3"))
            except Exception:
                interval = 3.0

        attempt = 0
        last_exc: Exception | None = None
        while True:
            try:
                attempt += 1
                self.connection = await aio_pika.connect_robust(self.rabbitmq_url)
                self.channel = await self.connection.channel()
                for queue_name in CHANNELS:
                    await self.channel.declare_queue(queue_name, durable=True)
                print("Connected to RabbitMQ")
                return
            except Exception as exc:
                last_exc = exc
                if attempt >= retries:
                    print(f"Failed to connect to RabbitMQ after {attempt} attempts: {exc}")
                    raise
                print(f"RabbitMQ not ready (attempt {attempt}/{retries}), retrying in {interval}s...")
                await asyncio.sleep(interval)

    async def sub(self, queue_name: Channels, callback: Callable[[Any], Coroutine]):
        """Subscribe to a queue and process messages with the given async callback."""
        if not self.channel:
            await self.connect()
        assert self.channel is not None
        queue = await self.channel.declare_queue(queue_name, durable=True)
        
        async def on_message(message: aio_pika.abc.AbstractIncomingMessage):
            async with message.process():
                data = deserialize_json(message.body)
                await callback(data)

        await queue.consume(on_message)
        print(f"Subscribed to {queue_name}")

    async def pub(self, queue_name: Channels, message: dict):
        """Publish a message to a queue."""
        if not self.channel:
            await self.connect()
        assert self.channel is not None
        body = serialize_json(message)
        await self.channel.default_exchange.publish(
            aio_pika.Message(
                body=body,
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT
            ),
            routing_key=queue_name
        )
        
