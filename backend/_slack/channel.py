import slack
from slack.events import Message
import re
import asyncio

from channel import GenericChannel

mention = re.compile(r"<@([A-Za-z0-9]+)>")


class SlackChannel(GenericChannel):
    def __init__(self, channel, client):
        self.client = client
        self.profiles = {}
        super(SlackChannel, self).__init__(channel)

    def __str__(self):
        return f"slack_{self.channel}"

    def serialise(self):
        return {
            "type": "slack",
            "id": self.channel
        }

    async def post(self, message: str, username: str, avatar_url: str):
        await self.client.query(
            slack.methods.CHAT_POST_MESSAGE,
            data={
                "channel": self.channel,
                "text": message,
                "icon_url": avatar_url,
                "username": username
            })

    async def get_profile(self, user_id):
        if user_id in self.profiles:
            return self.profiles[user_id]
        user_profile = await self.client.query(
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

    async def on_message_handler(self, message: Message):
        if message["channel"] == self.channel and not message["user"].startswith("B"):
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

            await self.on_message(
                text,
                user_profile["username"],
                user_profile["avatar_url"]
            )
