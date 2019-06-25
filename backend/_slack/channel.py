from channel import GenericChannel

class SlackChannel(GenericChannel):
  def __str__(self):
    return f"slack_{self.channel.id}"
  
  def serialise(self):
    return {
      "type": "slack",
      "id": self.channel.id
    }
  
  async def post(self, message: str):
    await self.channel.send(message)
