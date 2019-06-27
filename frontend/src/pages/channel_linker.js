import React from 'react';

import Websocket from 'react-websocket';
import queryString from 'querystring';


class ChannelLinker extends React.Component {
  getApiURL() {
    return queryString.parse(window.location.search.slice(1)).callback || `${window.location.host}`;
  }

  onMessage(message) {
    console.log(message);
  }

  render() {
    return (
      <div>
        <Websocket 
          url={`ws://${this.getApiURL()}/ws`} 
          onMessage={this.onMessage}
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