from typing import List
import asyncio


class GenericChannel:
    def __init__(self, channel):
        self.channel = channel
        self.message_handlers: List = []

    def __str__(self):
        raise NotImplementedError()

    def serialise(self):
        raise NotImplementedError()

    async def post(self, message: str, username: str, avatar_url: str):
        raise NotImplementedError()

    def add_listener(self, listener):
        self.message_handlers.append(listener)

    async def on_message(self, message: str, username: str, avatar_url: str):
        callbacks = []
        for handler in self.message_handlers:
            callbacks.append(handler(message, username, avatar_url))
        await asyncio.gather(*callbacks)
