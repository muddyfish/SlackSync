import yaml


class Config:
    def __init__(self, config):
        self.config = config

    @classmethod
    def from_file(cls, config_name="config.yaml"):
        with open(config_name) as conf_file:
            return Config(yaml.load(conf_file, Loader=yaml.SafeLoader))

    @property
    def discord(self):
        return self.config["discord"]

    @property
    def slack(self):
        return self.config["slack"]
