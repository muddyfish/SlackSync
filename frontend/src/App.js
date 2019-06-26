import React, {Component} from 'react';
import 'semantic-ui-less/semantic.less';

import DiscordSetup from './pages/discord_setup';
import SlackSetup from './pages/slack_setup';
import update from "immutability-helper";

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
              rendered: <SlackSetup callback={({botToken}) => {
                this.setState(update(this.state, {
                  $merge: {
                    discordBotToken,
                    discordClientSecret,
                    slackBotToken: botToken
                  }
                }));
              }}/>
            }
          }));
        }}/>
      }
    }));
  }

  render() {
    console.log(this.state);
    return this.state.rendered;
  }
}

export default Setup;
