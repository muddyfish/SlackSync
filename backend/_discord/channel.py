from discord import Webhook, TextChannel, Message
from channel import GenericChannel

channel_webhooks = {}


class DiscordChannel(GenericChannel):
    def __str__(self):
        return f"discord_{self.channel.id}"

    def serialise(self):
        return {
            "type": "discord",
            "id": str(self.channel.id)
        }

    async def post(self, message: str, username: str, avatar_url: str):
        webhook = await get_channel_webhook(self.channel)
        await webhook.send(
            content=message.replace("@everyone", "@\u200beveryone").replace("@here", "@\u200bhere"),
            username=username,
            avatar_url=avatar_url
        )

    async def on_message_handler(self, message: Message):
        if str(message.channel.id) == str(channel_id) and not message.author.bot:
            await self.on_message(
                message.clean_content,
                message.author.display_name,
                str(message.author.avatar_url_as(format="png", size=256))
            )

async def get_channel_webhook(channel: TextChannel) -> Webhook:
    if channel in channel_webhooks:
        a, b = channel_webhooks[channel]
        channel_webhooks[channel] = b, a
        return a
    webhooks = await channel.webhooks()
    for i in range(2-len(webhooks)):
        webhooks.append(await channel.create_webhook(name=f"Sync-{i+1}"))
    a, b, *_ = webhooks
    channel_webhooks[channel] = a, b
    return b
