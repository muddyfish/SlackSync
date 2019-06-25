from typing import Optional

from .channel import DiscordChannel

def unserialise_channel(serialised) -> Optional[DiscordChannel]:
  channel_id = serialised["id"]
  return bot.get_channel(channel_id)