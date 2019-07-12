from typing import Optional
import asyncio
from discord import Client, Message, TextChannel
from weakref import WeakValueDictionary, WeakSet

from .channel import DiscordChannel
from generic_handler import GenericHandler


class DiscordHandler(GenericHandler):
    def __init__(self):
        super(DiscordHandler, self).__init__()
        self.bot = Client()
        self.message_handlers = WeakSet()
        self.channels = WeakValueDictionary()
    
    async def setup(self, token, client_secret):
        await self.bot.login(token=token, bot=True)
        asyncio.ensure_future(self.bot.connect(reconnect=True))
        await self.bot.wait_until_ready()
        print("Logged into Discord")
        self.bot.event(self.on_message)
        self.bot.event(self.on_guild_channel_create)
        self.bot.event(self.on_guild_channel_delete)
        self.bot.event(self.on_guild_channel_update)

    def get_channel(self, serialised) -> Optional[DiscordChannel]:
        channel_id = serialised.get("id")
        try:
            return self.channels[channel_id]
        except KeyError:
            pass
        try:
            channel = self.bot.get_channel(int(channel_id))
        except ValueError:
            return
        if not channel:
            return
        rtn = DiscordChannel(channel)
        self.message_handlers.add(rtn.on_message_handler)
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
            for channel in self.bot.get_all_channels()
            if (channel.permissions_for(channel.guild.me).manage_webhooks and
                isinstance(channel, TextChannel)
            )
        ]

    async def on_message(self, message):
        await asyncio.gather(*[handler(message) for handler in self.message_handlers])

    async def on_guild_channel_create(self, channel):
        await self.process_channel_handlers()
        
    async def on_guild_channel_delete(self, channel):
        await self.process_channel_handlers()

    async def on_guild_channel_update(self, before, after):
        await self.process_channel_handlers()
