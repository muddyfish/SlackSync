from channel import GenericChannel


class DiscordChannel(GenericChannel):
    def __str__(self):
        return f"discord_{self.channel.id}"

    def serialise(self):
        return {
            "type": "discord",
            "id": self.channel.id
        }

    async def post(self, message: str):
        await self.channel.send(message)
