from aiohttp.web import WebSocketResponse
import json


async def ws(request):
    ws = WebSocketResponse()
    await ws.prepare(request)
    chat_handlers = request["chat_handlers"]

    async def send_message(msg_type, **kwargs):
        await ws.send_str(json.dumps({
            "type": msg_type,
            **kwargs
        }))

    async def on_channel_update(channels):
        await send_message("channel_update", channels=channels)


    for chat_handler in chat_handlers:
        chat_handler.add_channel_handler(on_channel_update)
        await send_message("channel_update", channels=chat_handler.serialised_channels)

    async for msg in ws:
        if msg.type == aiohttp.WSMsgType.TEXT:
            data = json.loads(msg.data)
            hander = handlers[data["type"]]
            del data["type"]
            await hander(ws=ws, **data)

    return ws