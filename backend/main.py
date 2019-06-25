import asyncio

from _discord.message_reader import unserialise_channel as unserialise_discord
from _discord.message_reader import discord_setup
from _slack.message_reader import unserialise_channel as unserialise_slack

from config import Config
from channel_linker import ChannelLinker
from storage import json_storage


channel_handlers = {
    "discord": unserialise_discord,
    "slack": unserialise_slack
}


async def main():
    config = Config.from_file()

    await discord_setup(config.discord)
    #await slack_setup()

    serialised_links = json_storage.load()
    links = []

    for link in serialised_links:
        channels = {}
        for src in ["target", "dest"]:
            handler = channel_handlers.get(link[src]["type"])
            if not handler:
                continue
            channel = handler(link[src])
            if not channel:
                continue
            channels[src] = channel
        links.append(ChannelLinker(**channels))

    while True:
        await asyncio.sleep(3600)


if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
