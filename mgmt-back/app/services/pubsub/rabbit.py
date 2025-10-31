import aio_pika
import asyncio
from typing import Callable, Coroutine, Any
import json
from .channels import CHANNELS, Channels

def serialize_json(message: dict) -> bytes:
    return json.dumps(message).encode('utf-8')

def deserialize_json(body: bytes) -> dict:
    return json.loads(body.decode('utf-8'))

class RabbitPubSubService:
    def __init__(self, host: str, port: int):
        self.rabbitmq_url = f"amqp://guest:guest@{host}:{port}/"
        self.connection = None
        self.channel = None

    async def connect(self):
        """Connect to RabbitMQ and declare queues."""
        self.connection = await aio_pika.connect_robust(self.rabbitmq_url)
        self.channel = await self.connection.channel()
        for queue_name in CHANNELS:
            await self.channel.declare_queue(queue_name, durable=True)

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
        
