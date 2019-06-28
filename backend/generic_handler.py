from weakref import WeakSet


class GenericHandler:
    def __init__(self):
        self.channel_handlers = WeakSet()

    def add_channel_handler(self, handler):
        self.channel_handlers.add(handler)
    
    async def process_channel_handlers(self):
        for handler in self.channel_handlers:
            await handler()
    
    @property
    def serialised_channels(self):
        return []
