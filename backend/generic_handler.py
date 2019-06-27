from weakref import WeakSet


class GenericHandler:
    def __init__(self):
        self.channel_handlers = WeakSet()

    def add_channel_handler(self, handler):
        self.channel_handlers.add(handler)
    
    async def process_channel_handlers(self):
        print(len(self.channel_handlers))
        for handler in self.channel_handlers:
            await handler(self.serialised_channels)
    
    @property
    def serialised_channels(self):
        return []