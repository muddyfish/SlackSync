import React, {createRef} from 'react';

import Websocket from 'react-websocket';
import update from "immutability-helper";
import queryString from 'querystring';
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd'

import { List, Image, Grid, Ref, Segment, Divider, Icon, Placeholder, Item, Sticky, Button } from 'semantic-ui-react'

import './channel_linker.css';

const imageURLS = {
  slack: "/Slack_Mark_Monochrome_White.svg",
  discord: "Discord-Logo-White.svg"
}

const lightImageURLS = {
  slack: "/Slack_Mark_Monochrome_Black.svg",
  discord: "Discord-Logo-Black.svg"
}


function Channel({channel}) {
  const [_, drag] = useDrag({
    item: {
      type: "CHANNEL",
      channel
    }
  });
  return (
    <Ref innerRef={drag}>
      <List.Item>
        <Image avatar size='mini' verticalAlign='middle' src={imageURLS[channel.type]} />
        <List.Content>
          <List.Header>{channel.server.name}</List.Header>
          <List.Description>{channel.name}</List.Description>
        </List.Content>
      </List.Item>
    </Ref>
  );
}

function ChannelDropper({channel, onDrop}) {
  const [_, drop] = useDrop({
    accept: "CHANNEL",
    drop: (item) => {
      onDrop(item.channel);
    },
  });

  return (
    <Ref innerRef={drop}>
      <Segment raised>
        { channel === null &&
          <Placeholder>
            <Placeholder.Header image>
              <Placeholder.Line/>
              <Placeholder.Line/>
            </Placeholder.Header>
          </Placeholder>
        }
        { channel !== null &&
          <Item.Group>
            <Item>
              <Item.Image size='mini' src={imageURLS[channel.type]} />
              <Item.Content>
                <Item.Header className="white">{channel.server.name}</Item.Header>
                <Item.Description className="white">{channel.name}</Item.Description>
              </Item.Content>
            </Item>
          </Item.Group>
        }
      </Segment>
    </Ref>
  );
}

class ChannelLinker extends React.Component {
  channelDropperRef = createRef();

  constructor(props) {
    super(props);
    this.state = {
      channels: [],
      links: [],
      channelL: null,
      channelR: null
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

  linkChannels() {
    this.setState(update(this.state, {
      $merge: {
        channelL: null,
        channelR: null,
        links: this.state.links.concat([{
          id: `${this.state.channelR.id}:${this.state.channelL.id}`,
          source: this.state.channelL,
          target: this.state.channelR
        }])
      }
    }));
  }

  renderDNDtargets() {
    return (
      <Segment color="grey" inverted>
        <Divider vertical>
          <Icon name="arrows alternate horizontal"/>
        </Divider>
        <Grid stackable textAlign='center' columns={2} padded>
          <Grid.Row>
            <Grid.Column>
              <ChannelDropper channel={this.state.channelL} onDrop={(channel) => {
                this.setState(update(this.state, {
                  $merge: {
                    channelL: channel
                  }
                }));
              }}/>
            </Grid.Column>
            <Grid.Column>
              <ChannelDropper channel={this.state.channelR} onDrop={(channel) => {
                this.setState(update(this.state, {
                  $merge: {
                    channelR: channel
                  }
                }));
              }}/>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    )
  }

  renderChannelLink(link) {
    const channelL = this.state.channels.find(channel => channel.id === link.source.id);
    const channelR = this.state.channels.find(channel => channel.id === link.target.id);
    return (
      <Segment color="grey" inverted key={link.id}>
        <Divider vertical>
          <Icon name="arrows alternate horizontal"/>
        </Divider>
        <Grid stackable textAlign='center' columns={2} padded>
          <Grid.Row>
            <Grid.Column>
              <ChannelDropper channel={channelL} onDrop={(channel) => {
                const links = JSON.parse(JSON.stringify(this.state.links));
                links[links.findIndex(l => l.id === link.id)] = {
                  id: `${channelR.id}:${channel.id}`,
                  source: channel,
                  target: channelR
                };
                console.log({links, link});
                this.setState(update(this.state, {
                  $merge: {
                    links
                  }
                }));
              }}/>
            </Grid.Column>
            <Grid.Column>
              <ChannelDropper channel={channelR} onDrop={(channel) => {

              }}/>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    )
  }

  render() {
    return (
      <DndProvider backend={HTML5Backend}>
        <Ref innerRef={this.channelDropperRef}>
          <Grid container columns={2} >
            <Grid.Column width={4} color="grey">
              <List divided relaxed inverted selection>
                {this.state.channels.map(channel => <Channel channel={channel} key={channel.id}/>)}
              </List>
            </Grid.Column>
            <Grid.Column width={12} color="grey">
              <Sticky context={this.channelDropperRef}>
                { this.renderDNDtargets() }
                <Grid>
                  <Grid.Column textAlign="center">
                    <Button
                      color="violet"
                      content="Link Channels"
                      disabled={this.state.channelL === null || this.state.channelR === null}
                      onClick={() => this.linkChannels()}
                    />
                  </Grid.Column>
                </Grid>
                <Divider/>
                { this.state.links.map(link => this.renderChannelLink(link)) }
              </Sticky>
            </Grid.Column>
          </Grid>
        </Ref>
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
      </DndProvider>
    );
  }
}

export default ChannelLinker;