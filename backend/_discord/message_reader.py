from typing import Optional
import asyncio
from discord import Client, Message
from weakref import WeakValueDictionary

from .channel import DiscordChannel


bot = Client()
message_handlers = []
channels = WeakValueDictionary()


def unserialise_channel(serialised) -> Optional[DiscordChannel]:
    channel_id = serialised["id"]
    try:
        return channels[channel_id]
    except KeyError:
        pass
    channel = bot.get_channel(channel_id)
    rtn = DiscordChannel(channel)

    async def on_message_handler(message: Message):
        if message.channel.id == channel_id and not message.author.bot:
            await rtn.on_message(
                message.clean_content,
                message.author.display_name,
                str(message.author.avatar_url_as(format="png", size=256))
            )
    message_handlers.append(on_message_handler)
    channels[channel_id] = rtn
    return rtn


async def discord_setup(config):
    await bot.login(token=config["token"], bot=True)
    asyncio.ensure_future(bot.connect(reconnect=True))
    await bot.wait_until_ready()
    print("Logged into Discord")


@bot.event
async def on_message(message):
    callbacks = []
    for handler in message_handlers:
        callbacks.append(handler(message))
    await asyncio.gather(*callbacks)
