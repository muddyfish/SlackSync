from aiohttp.web import FileResponse


async def index(request):
    return FileResponse("./static/index.html")


async def setup(request):
    return FileResponse("./static/index.html")
