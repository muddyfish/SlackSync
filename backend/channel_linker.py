from channel import GenericChannel


def deserialise(serialised_links, chat_handlers):
    links = []
    for link in serialised_links:
        channels = {}
        for src in ["source", "target"]:
            channel = None
            for chat_handler in chat_handlers:
                channel = chat_handler.get_channel(link[src])
                if channel:
                    break
            if not channel:
                continue
            channels[src] = channel
        links.append(ChannelLinker(**channels))
    return links


class ChannelLinker:
    def __init__(self, source: GenericChannel, target: GenericChannel):
        self.source = source
        self.target = target
        self.source.add_listener(self.message_listener)

    def __repr__(self):
        return f'<ChannelLinker("{self.source}", "{self.target}")>'

    def serialise(self):
        return {
            "id": str(self),
            "source": self.source.serialise(),
            "target": self.target.serialise()
        }

    async def message_listener(self, message: str, username: str, avatar_url: str):
        await self.target.post(message, username, avatar_url)

