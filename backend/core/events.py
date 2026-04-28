"""
RabbitMQ event bus — publish / subscribe abstraction.

Key design: subscribe() is NON-BLOCKING.  It registers an async callback
via aio_pika's built-in consumer so multiple subscriptions can coexist
in the same asyncio event-loop (critical for the Matching worker which
listens on two queues simultaneously).
"""

import json
import aio_pika
from typing import Callable, Any

from core.config import settings
from core.logging_config import get_logger

log = get_logger("core.events")


class EventBus:
    def __init__(self):
        self.connection = None
        self.channel = None
        self.exchange = None

    async def connect(self):
        self.connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
        self.channel = await self.connection.channel()
        # Prefetch 1 message at a time per worker for fair dispatch
        await self.channel.set_qos(prefetch_count=1)
        self.exchange = await self.channel.declare_exchange(
            "shieldstream_events", aio_pika.ExchangeType.TOPIC, durable=True
        )
        log.info("Connected to RabbitMQ.")

    async def close(self):
        if self.connection:
            await self.connection.close()
            log.info("Closed RabbitMQ connection.")

    async def publish(self, routing_key: str, message: Any):
        """Publish a Pydantic model as a JSON message."""
        if not self.exchange:
            await self.connect()

        body = message.model_dump_json().encode()
        msg = aio_pika.Message(
            body=body,
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
        )
        await self.exchange.publish(msg, routing_key=routing_key)
        log.info("⚡ Published  [%s]  event_id=%s", routing_key, message.event_id)

    async def subscribe(self, queue_name: str, routing_key: str, callback: Callable):
        """
        Register a NON-BLOCKING consumer.

        `callback` receives a single dict (the parsed JSON payload).
        Multiple calls to subscribe() can run concurrently inside
        the same event-loop — each one returns immediately.
        """
        if not self.channel:
            await self.connect()

        queue = await self.channel.declare_queue(queue_name, durable=True)
        await queue.bind(self.exchange, routing_key)

        async def _on_message(message: aio_pika.IncomingMessage):
            async with message.process():
                try:
                    payload = json.loads(message.body.decode())
                    log.info(
                        "📥 Received  [%s]  on queue=%s", routing_key, queue_name
                    )
                    await callback(payload)
                except Exception as exc:
                    log.exception(
                        "Error processing message on %s: %s", queue_name, exc
                    )

        await queue.consume(_on_message)
        log.info("👂 Subscribed  queue=%s  key=%s", queue_name, routing_key)


# Global singleton — import this everywhere
event_bus = EventBus()
