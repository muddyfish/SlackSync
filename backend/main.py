from discord_message_reader import setup as discord_setup, on_message as on_discord_message
from discord_webhook import send_message as send_discord_message

from slack_message_reader import setup as slack_setup, on_message as on_slack_message
from slack_webhook import send_message as send_slack_message

from storage import json_storage


async def main():
  await discord_setup()
  await slack_setup()

  links = json_storage.load()
