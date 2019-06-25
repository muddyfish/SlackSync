class GenericChannel:
    def __init__(self, channel):
        self.channel = channel
        self.message_handlers = []

    def __str__(self):
        raise NotImplementedError()

    def serialise(self):
        raise NotImplementedError()

    async def post(self, message: str):
        raise NotImplementedError()

    def add_listener(self, listener):
        self.message_handlers.append(listener)
