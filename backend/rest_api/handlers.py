from aiohttp import web
import aiohttp_cors
from asyncio import Event
import webbrowser

from .routes import setup
from .routes import websocket
from .routes import static

serve_static = False


async def initialise_app(chat_handlers, channel_links, use_lock):
    event = None
    if use_lock:
        event = Event()
    app = web.Application(middlewares=[
        add_request(
            unlock=event,
            chat_handlers=chat_handlers,
            channel_links=channel_links
        )
    ])
    await add_handlers(app)
    if serve_static:
        app.router.add_static("/", "static")
    await add_cors(app)

    runner = web.AppRunner(app)
    await runner.setup()
    port = 8888
    site = web.TCPSite(runner, "localhost", port)
    print(f"Started website at localhost:{port}")
    await site.start()
    if use_lock:
        if serve_static:
            webbrowser.open(f"http://localhost:{port}/setup")
        await event.wait()


def add_request(**kwargs):
    async def _middleware(app, handler):
        async def _inner(request: web.Request):
            request.update(kwargs)
            return await handler(request)
        return _inner
    return _middleware


async def add_handlers(app: web.Application):
    app.router.add_post("/setup", setup.setup)
    app.router.add_get("/ws", websocket.ws)
    app.router.add_get("/", static.index)
    app.router.add_get("/setup", static.setup)


async def add_cors(app):
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
        )
    })

    for route in list(app.router.routes()):
        cors.add(route)
