from typing import Optional
import asyncio
from discord import Client

from .channel import DiscordChannel


bot = Client()


def unserialise_channel(serialised) -> Optional[DiscordChannel]:
    channel_id = serialised["id"]
    return DiscordChannel(bot.get_channel(channel_id))


async def discord_setup(config):
    await bot.login(token=config["token"], bot=True)
    asyncio.ensure_future(bot.connect(reconnect=True))
    await bot.wait_until_ready()
    print("Logged into Discord")


@bot.event
async def on_message(message):
    print(message)
