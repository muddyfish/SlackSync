class ChannelLinker:
    def __init__(self, target, dest):
        self.target = target
        self.dest = dest
        self.target.add_listener(self.message_listener)

    def __str__(self):
        return f"{self.target}_{self.dest}"

    def serialise(self):
        return {
            "id": str(self),
            "target": self.target.serialise(),
            "dest": self.target.serialise()
        }

    async def message_listener(message):
        await self.dest.post(message)
