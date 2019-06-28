import asyncio
from aiohttp.web import json_response
import yaml


async def setup(request):
    chat_handlers = request["chat_handlers"]

    content = await request.json()
    discord_bot_token = content["discordBotToken"]
    discord_client_secret = content["discordClientSecret"]
    slack_bot_token = content["slackBotToken"]

    with open("config.yaml", "w") as config_f:
        yaml.dump({
            "discord": {
                "token": discord_bot_token,
                "client_secret": discord_client_secret
            },
            "slack": {
                "token": slack_bot_token
            }
        }, config_f)

    request["unlock"].set()

    while len(chat_handlers) == 0:
        await asyncio.sleep(1)

    return json_response(data={
        "ok": True
    })
