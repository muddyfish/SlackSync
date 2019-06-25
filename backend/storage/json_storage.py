from typing import List
import json


def load() -> List:
    try:
        with open("links.json") as links_f:
            return json.load(links_f)
    except IOError:
        return []


def save(links: List):
    with open("links.json", "w") as links_f:
        json.dump(links, links_f)
