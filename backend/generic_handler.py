from weakref import WeakMethod


class GenericHandler:
    def __init__(self):
        self.channel_handlers = []

    def add_channel_handler(self, handler):
        self.channel_handlers.append(WeakMethod(handler))
    
    async def process_channel_handlers(self, channel):
        channel_handlers = []
        for handler in self.channel_handlers:
            method = handler()
            if method:
                channel_handlers.append(handler)
                await method(self.serialised_channels)
        self.channel_handlers = channel_handlers
    
    @property
    def serialised_channels(self):
        return []