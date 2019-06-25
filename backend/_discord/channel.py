from discord import Webhook, TextChannel
from channel import GenericChannel

channel_webhooks = {}


class DiscordChannel(GenericChannel):
    def __str__(self):
        return f"discord_{self.channel.id}"

    def serialise(self):
        return {
            "type": "discord",
            "id": self.channel.id
        }

    async def post(self, message: str, username: str, avatar_url: str):
        print(message, username, avatar_url)
        webhook = await get_channel_webhook(self.channel)
        await webhook.send(
            content=message.replace("@everyone", "").replace("@here", ""),
            username=username,
            avatar_url=avatar_url
        )


async def get_channel_webhook(channel: TextChannel) -> Webhook:
    if channel in channel_webhooks:
        a, b = channel_webhooks[channel]
        channel_webhooks[channel] = b, a
        return a
    webhooks = await channel.webhooks()
    for i in range(2-len(webhooks)):
        webhooks.append(await channel.create_webhook(name=f"NQN-{i+1}"))
    a, b, *_ = webhooks
    channel_webhooks[channel] = a, b
    return b
