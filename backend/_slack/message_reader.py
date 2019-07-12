from typing import Optional
import asyncio
from aiohttp import ClientSession
from weakref import WeakValueDictionary, WeakSet

import slack
from slack.events import Message, Event
from slack.io.aiohttp import SlackAPI

from .channel import SlackChannel
from generic_handler import GenericHandler


class SlackHandler(GenericHandler):
    def __init__(self):
        super(SlackHandler, self).__init__()
        session = ClientSession()
        self.slack_client = SlackAPI(token=None, session=session)

        self.channels = WeakValueDictionary()

    async def setup(self, token):
        self.slack_client._token = token
        await self.update_team_info()
        await self.update_channels()
        asyncio.ensure_future(self.rtm())
        print("Logged into Slack")

    def get_channel(self, serialised) -> Optional[SlackChannel]:
        channel_id = serialised["id"]
        try:
            return self.channels[channel_id]
        except KeyError:
            pass
        rtn = SlackChannel(channel_id, self.slack_client)
        self.channels[channel_id] = rtn
        return rtn

    async def rtm(self):
        async for event in self.slack_client.rtm():
            if isinstance(event, Message):
                await asyncio.gather(*[channel.on_message_handler(event) for channel in self.channels.values()])
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
