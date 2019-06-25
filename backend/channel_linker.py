from channel import GenericChannel


class ChannelLinker:
    def __init__(self, target, dest):
        self.target: GenericChannel = target
        self.dest: GenericChannel = dest
        self.target.add_listener(self.message_listener)

    def __repr__(self):
        return f'<ChannelLinker("{self.target}", "{self.dest}")>'

    def serialise(self):
        return {
            "id": str(self),
            "target": self.target.serialise(),
            "dest": self.target.serialise()
        }

    async def message_listener(self, message: str, username: str, avatar_url: str):
        await self.dest.post(message, username, avatar_url)
