import React from 'react';

import Websocket from 'react-websocket';
import update from "immutability-helper";
import queryString from 'querystring';
import { useDrag } from 'react-dnd'

import { List, Image, Grid } from 'semantic-ui-react'

const imageURLS = {
  slack: "/Slack_Mark_Monochrome_White.svg",
  discord: "Discord-Logo-White.svg"
}

class ChannelLinker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      channels: [],
      links: []
    }
  }

  getApiURL() {
    return queryString.parse(window.location.search.slice(1)).callback || `${window.location.host}`;
  }

  onMessage(message) {
    const data = JSON.parse(message);
    if (data.type === "channel_update") {
      this.setState(update(this.state, {
        $merge: {
          channels: data.channels
        }
      }));
    }
    else if (data.type === "channel_links_update") {
      this.setState(update(this.state, {
        $merge: {
          links: data.channel_links
        }
      }));
    }
    else {
      alert(`Unknown message type ${data.type}`);
    }
  }

  renderChannel(channel) {
    return (
      <List.Item key={channel.id}>
        <Image avatar size='mini' verticalAlign='middle' src={imageURLS[channel.type]} />
        <List.Content>
          <List.Header>{channel.server.name}</List.Header>
          <List.Description>{channel.name}</List.Description>
        </List.Content>
      </List.Item>
    );
  }

  render() {
    console.log(this.state);
    return (
      <div>
        <Grid container columns={2}>
          <Grid.Column width={3} color="grey">
            <List divided relaxed inverted selection>
              {this.state.channels.map(channel => this.renderChannel(channel))}
            </List>
          </Grid.Column>
          <Grid.Column width={13} color="grey">
            Awoo
          </Grid.Column>
        </Grid>
        <Websocket
          url={`ws://${this.getApiURL()}/ws`}
          onMessage={message => this.onMessage(message)}
          reconnect={true}
          debug={true}
          ref={ws => {
            if (ws === null) {
              return
            }
            this.sendMessage = ws.sendMessage;
          }}/>
      </div>
    );
  }
}

export default ChannelLinker;