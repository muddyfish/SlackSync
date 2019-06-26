import React, {Component} from 'react';
import 'semantic-ui-less/semantic.less';

import update from "immutability-helper";
import queryString from 'querystring';
import axios from 'axios';

import DiscordSetup from './pages/discord_setup';
import SlackSetup from './pages/slack_setup';

class Setup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      discordBotToken: "",
      discordClientSecret: "",
      slackBotToken: "",
      rendered: <div/>
    }
  }

  componentDidMount() {
    this.setState(update(this.state, {
      $merge: {
        rendered: <DiscordSetup callback={({botToken, clientSecret}) => {
          const discordBotToken = botToken;
          const discordClientSecret = clientSecret;
          this.setState(update(this.state, {
            $merge: {
              rendered: <SlackSetup callback={(botToken) => {
                this.setState(update(this.state, {
                  $merge: {
                    discordBotToken,
                    discordClientSecret,
                    slackBotToken: botToken
                  }
                }), () => {
                  this.sendCredentials();
                });
              }}/>
            }
          }));
        }}/>
      }
    }));
  }


  sendCredentials() {
    const callback = queryString.parse(window.location.search.slice(1)).callback || "/api";
    axios.post(`${callback}/setup`, {
      discordBotToken: this.state.discordBotToken,
      discordClientSecret: this.state.discordClientSecret,
      slackBotToken: this.state.slackBotToken,
    });
  }

  render() {
    return this.state.rendered;
  }
}

export default Setup;
