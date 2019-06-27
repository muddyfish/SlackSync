from typing import Optional
import asyncio
from discord import Client, Message
from weakref import WeakValueDictionary

from .channel import DiscordChannel
from generic_handler import GenericHandler

class DiscordHandler(GenericHandler):
    def __init__(self):
        super(DiscordHandler, self).__init__()
        self.bot = Client()
        self.message_handlers = []
        self.channels = WeakValueDictionary()
    
    async def setup(self, token, client_secret):
        await self.bot.login(token=token, bot=True)
        asyncio.ensure_future(self.bot.connect(reconnect=True))
        await self.bot.wait_until_ready()
        print("Logged into Discord")
        self.bot.event(self.on_message)
        self.bot.event("on_guild_channel_create", self.process_channel_handlers)
        self.bot.event("on_guild_channel_delete", self.process_channel_handlers)
        self.bot.event("on_guild_channel_update", self.process_channel_handlers)

    def get_channel(self, serialised) -> Optional[DiscordChannel]:
        channel_id = serialised.get("id")
        try:
            return self.channels[channel_id]
        except KeyError:
            pass
        channel = self.bot.get_channel(channel_id)
        if not channel:
            return
        rtn = DiscordChannel(channel)

        async def on_message_handler(message: Message):
            if message.channel.id == channel_id and not message.author.bot:
                await rtn.on_message(
                    message.clean_content,
                    message.author.display_name,
                    str(message.author.avatar_url_as(format="png", size=256))
                )
        self.message_handlers.append(on_message_handler)
        self.channels[channel_id] = rtn
        return rtn
    
    @property
    def serialised_channels(self):
        return [
            {
                "type": "discord",
                "id": f"{channel.id}",
                "name": channel.name,
                "server": {
                    "id": f"{channel.guild.id}",
                    "name": channel.guild.name,
                    "icon": str(channel.guild.icon_url_as(format="png", size=256))
                }
            }
            for channel in self.bot.channels
        ]

    async def on_message(self, message):
        await asyncio.gather(*[handler(message) for handler in self.message_handlers])
