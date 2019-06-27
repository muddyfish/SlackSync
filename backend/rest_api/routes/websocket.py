from aiohttp.web import WebSocketResponse
import json


async def ws(request):
    ws = WebSocketResponse()
    await ws.prepare(request)
    chat_handlers = request["chat_handlers"]

    async def on_channel_update(channels):
      print(channels)
    
    for chat_handler in chat_handlers:
      chat_handler.add_channel_handler(on_channel_update)

    async for msg in ws:
        if msg.type == aiohttp.WSMsgType.TEXT:
          data = json.loads(msg.data)
          hander = handlers[data["type"]]
          del data["type"]
          await hander(ws=ws, **data)

    return ws