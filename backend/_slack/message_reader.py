from typing import Optional

from .channel import SlackChannel

def unserialise_channel(serialised) -> Optional[SlackChannel]:
  channel_id = serialised["id"]
  