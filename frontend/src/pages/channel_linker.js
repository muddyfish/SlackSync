import React from 'react';

import Websocket from 'react-websocket';
import update from "immutability-helper";
import queryString from 'querystring';


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
    console.log(this.state)
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

  render() {
    console.log(this.state);
    return (
      <div>
        <Websocket 
          url={`ws://${this.getApiURL()}/ws`} 
          onMessage={() => this.onMessage}
          reconnect={true}
          debug={true}
          ref={Websocket => {
            this.sendMessage = Websocket.sendMessage;
          }}/>
      </div>
    );
  }
}

export default ChannelLinker;