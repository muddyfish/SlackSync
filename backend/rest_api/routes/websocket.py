from aiohttp.web import WebSocketResponse
import json


async def ws(request):
    ws = WebSocketResponse()
    await ws.prepare(request)

    async for msg in ws:
        if msg.type == aiohttp.WSMsgType.TEXT:
          data = json.loads(msg.data)
          hander = handlers[data["type"]]
          del data["type"]
          await hander(ws=ws, **data)

    return ws


async def link_channels(ws, source, dest):
    print(source, dest)


handlers = {
  "link_channels": link_channels
}
