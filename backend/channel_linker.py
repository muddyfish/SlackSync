from channel import GenericChannel


class ChannelLinker:
    def __init__(self, source: GenericChannel, target: GenericChannel):
        self.source = source
        self.target = target
        self.source.add_listener(self.message_listener)

    def __repr__(self):
        return f'<ChannelLinker("{self.source}", "{self.target}")>'

    def serialise(self):
        return {
            "id": str(self),
            "source": self.source.serialise(),
            "target": self.target.serialise()
        }

    async def message_listener(self, message: str, username: str, avatar_url: str):
        await self.target.post(message, username, avatar_url)
