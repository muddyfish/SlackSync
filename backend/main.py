import asyncio
import os

from _discord.message_reader import DiscordHandler
from _slack.message_reader import SlackHandler

from config import Config
from channel_linker import ChannelLinker, deserialise

from rest_api.handlers import initialise_app
from storage import json_storage


chat_handlers = []
links = []


async def main(setup_server):
    config = Config.from_file()

    discord = DiscordHandler()
    await discord.setup(**config.discord)
    slack = SlackHandler()
    await slack.setup(**config.slack)

    chat_handlers.append(discord)
    chat_handlers.append(slack)

    if setup_server:
        await initialise_app(chat_handlers, links, use_lock=False)

    serialised_links = json_storage.load()

    links[:] = deserialise(serialised_links, chat_handlers)

    while True:
        await asyncio.sleep(3600)


if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    setup_server = True
    if not os.path.exists("config.yaml"):
        setup_server = False
        loop.run_until_complete(initialise_app(chat_handlers, links, use_lock=True))
    loop.run_until_complete(main(setup_server))
