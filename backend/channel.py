class GenericChannel:
  def __init__(self, channel, message_handler):
    self.channel = channel
    self.message_handler = message_handler
  
  def __str__(self):
    raise NotImplementedError()
  
  def serialise(self):
    raise NotImplementedError()
  
  async def post(self, message: str):
    raise NotImplementedError()
