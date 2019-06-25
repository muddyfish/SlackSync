from discord.message_reader import unserialise_channel as unserialise_discord
from slack.message_reader import unserialise_channel as unserialise_slack

from channel_linker import ChannelLinker
from storage import json_storage


channel_handlers = {
  "discord": unserialise_discord,
  "slack": unserialise_slack
}


async def main():
  await discord_setup()
  await slack_setup()

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
    