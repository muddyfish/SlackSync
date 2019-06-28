from typing import Optional
import asyncio
from aiohttp import ClientSession
from weakref import WeakValueDictionary, WeakSet
import re

import slack
from slack.events import Message, Event
from slack.io.aiohttp import SlackAPI

from .channel import SlackChannel
from generic_handler import GenericHandler

mention = re.compile(r"<@([A-Za-z0-9]+)>")


class SlackHandler(GenericHandler):
    def __init__(self):
        super(SlackHandler, self).__init__()
        session = ClientSession()
        self.slack_client = SlackAPI(token=None, session=session)

        self.message_handlers = WeakSet()
        self.channels = WeakValueDictionary()
        self.profiles = {}

    async def setup(self, token):
        self.slack_client._token = token
        await self.update_team_info()
        await self.update_channels()
        asyncio.ensure_future(self.rtm())
        print("Logged into Slack")

    async def get_profile(self, user_id):
        if user_id in self.profiles:
            return self.profiles[user_id]
        user_profile = await self.slack_client.query(
            slack.methods.USERS_INFO,
            data={
                "user": user_id
            }
        )
        rtn = {
            "username": user_profile["user"]["profile"]["display_name"] or user_profile["user"]["profile"]["real_name_normalized"],
            "avatar_url": user_profile["user"]["profile"]["image_192"]
        }
        self.profiles[user_id] = rtn
        return rtn

    def get_channel(self, serialised) -> Optional[SlackChannel]:
        channel_id = serialised["id"]
        try:
            return self.channels[channel_id]
        except KeyError:
            pass
        rtn = SlackChannel(channel_id, self.slack_client)

        async def on_message_handler(message: Message):
            if message["channel"] == channel_id and not message["user"].startswith("B"):
                user_profile = await self.get_profile(message["user"])
                text = message["text"]
                mentioned_ids = re.findall(mention, text)
                username_map = {}

                async def inner(id):
                    profile = await self.get_profile(id)
                    username_map[id] = profile["username"]

                await asyncio.gather(*map(inner, mentioned_ids))

                for id, name in username_map.items():
                    text = re.sub(fr"<@{id}>", name, text)

                await rtn.on_message(
                    text,
                    user_profile["username"],
                    user_profile["avatar_url"]
                )

        rtn.on_message_handler = on_message_handler
        self.message_handlers.add(on_message_handler)
        self.channels[channel_id] = rtn
        return rtn

    async def rtm(self):
        async for event in self.slack_client.rtm():
            if isinstance(event, Message):
                await asyncio.gather(*[handler(event) for handler in self.message_handlers])
            if isinstance(event, Event):
                if event["type"].startswith("channel_"):
                    await self.update_channels()

    @property
    def serialised_channels(self):
        return self._serialised_channels

    async def update_channels(self):
        channels = await self.slack_client.query(
            slack.methods.CONVERSATIONS_LIST,
            data={
                "exclude_archived": True
            }
        )
        self._serialised_channels = [
            {
                "type": "slack",
                "id": channel["id"],
                "name": channel["name"],
                "server": self.team_info
            }
            for channel in channels["channels"]
            if channel["is_member"]
        ]
    
    async def update_team_info(self):
        team_info = await self.slack_client.query("https://slack.com/api/team.info")
        self.team_info = {
            "id": team_info["team"]["id"],
            "name": team_info["team"]["name"],
            "icon": team_info["team"]["icon"]["image_132"]
        }
