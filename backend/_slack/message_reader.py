from typing import Optional
import asyncio
from aiohttp import ClientSession
from weakref import WeakValueDictionary
import re

import slack
from slack.events import Message
from slack.io.aiohttp import SlackAPI

from .channel import SlackChannel

session = ClientSession()
slack_client = SlackAPI(token=None, session=session)


message_handlers = []
channels = WeakValueDictionary()

mention = re.compile(r"<@([A-Za-z0-9]+)>")

profiles = {}


async def get_profile(client, user_id):
    if user_id in profiles:
        return profiles[user_id]
    user_profile = await client.query(
        slack.methods.USERS_INFO,
        data={
            "user": user_id
        }
    )
    rtn = {
        "username": user_profile["user"]["profile"]["display_name"] or user_profile["user"]["profile"]["real_name_normalized"],
        "avatar_url": user_profile["user"]["profile"]["image_192"]
    }
    profiles[user_id] = rtn
    return rtn


def unserialise_channel(serialised) -> Optional[SlackChannel]:
    channel_id = serialised["id"]
    try:
        return channels[channel_id]
    except KeyError:
        pass
    rtn = SlackChannel(channel_id, slack_client)

    async def on_message_handler(message: Message):
        if message["channel"] == channel_id and not message["user"].startswith("B"):
            user_profile = await get_profile(slack_client, message["user"])
            text = message["text"]
            mentioned_ids = re.findall(mention, text)
            username_map = {}

            async def inner(id):
                profile = await get_profile(slack_client, id)
                username_map[id] = profile["username"]

            await asyncio.gather(*map(inner, mentioned_ids))

            for id, name in username_map.items():
                text = re.sub(fr"<@{id}>", name, text)

            await rtn.on_message(
                text,
                user_profile["username"],
                user_profile["avatar_url"]
            )
    message_handlers.append(on_message_handler)
    channels[channel_id] = rtn
    return rtn


async def rtm(client):
    async for event in client.rtm():
        if isinstance(event, Message):
            callbacks = []
            for handler in message_handlers:
                callbacks.append(handler(event))
            await asyncio.gather(*callbacks)


async def slack_setup(config):
    slack_client._token = config["token"]
    asyncio.ensure_future(rtm(slack_client))
    print("Logged into Slack")
