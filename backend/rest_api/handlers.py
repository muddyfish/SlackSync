from aiohttp import web
import aiohttp_cors
from asyncio import Event

from .routes import setup


async def initialise_app(use_lock):
    event = None
    if use_lock:
        event = Event()
    app = web.Application(middlewares=[
        add_requset(
            unlock=event
        )
    ])
    await add_handlers(app)
    await add_cors(app)

    runner = web.AppRunner(app)
    await runner.setup()
    port = 8888
    site = web.TCPSite(runner, "localhost", port)
    print(f"Started website at localhost:{port}")
    await site.start()
    if use_lock:
        await event.wait()


def add_requset(**kwargs):
    async def _middleware(app, handler):
        async def _inner(request: web.Request):
            request.update(kwargs)
            return await handler(request)
        return _inner
    return _middleware


async def add_handlers(app: web.Application):
    app.router.add_post("/setup", setup.setup)


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
