import slack

from channel import GenericChannel


class SlackChannel(GenericChannel):
    def __init__(self, channel, client):
        self.client = client
        super(SlackChannel, self).__init__(channel)

    def __str__(self):
        return f"slack_{self.channel}"

    def serialise(self):
        return {
            "type": "slack",
            "id": self.channel
        }

    async def post(self, message: str, username: str, avatar_url: str):
        await self.client.query(
            slack.methods.CHAT_POST_MESSAGE,
            data={
                "channel": self.channel,
                "text": message,
                "icon_url": avatar_url,
                "username": username
            })
