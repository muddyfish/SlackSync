import React, {createRef} from 'react';

import Websocket from 'react-websocket';
import update from "immutability-helper";
import queryString from 'querystring';
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd'
import ReactHoverObserver from 'react-hover-observer';


import { List, Image, Grid, Ref, Segment, Divider, Icon, Placeholder, Item, Sticky, Button, Input } from 'semantic-ui-react'

import './channel_linker.css';

const imageURLS = {
  slack: "/Slack_Mark_Monochrome_White.svg",
  discord: "Discord-Logo-White.svg"
}


const arrows = ["arrows alternate horizontal", "arrow left", "arrow right"];


function Channel({channel, mouseClick}) {
  const drag = useDrag({
    item: {
      type: "CHANNEL",
      channel
    }
  });
  return (
    <Ref innerRef={drag[1]}>
      <List.Item
        onMouseDown={() => {mouseClick(true)}}
        onMouseUp={() => {mouseClick(false)}}
        onMouseMove={() => {mouseClick(false)}}
      >
        <Image avatar size='mini' verticalAlign='middle' src={imageURLS[channel.type]} />
        <List.Content>
          <List.Header>{channel.server.name}</List.Header>
          <List.Description>{channel.name}</List.Description>
        </List.Content>
      </List.Item>
    </Ref>
  );
}

function ChannelDropper({channel, forceHighlights, onDrop}) {
  const [{canDrop}, drop] = useDrop({
    accept: "CHANNEL",
    drop: (item) => {
      onDrop(item.channel);
    },
    collect: (monitor) => ({
      canDrop: !!monitor.canDrop()
    })
  });

  return (
    <Ref innerRef={drop}>
      <Segment
        raised
        className={canDrop || forceHighlights? "hover_animate": ""}
      >
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
  topRef = createRef();

  constructor(props) {
    super(props);
    this.state = {
      channels: [],
      links: [],
      channelL: null,
      channelR: null,
      direction: 0,
      channelFilter: "",
      forceHighlights: false
    }
  }

  getApiURL() {
    return queryString.parse(window.location.search.slice(1)).callback || window.location.host;
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
      const links = [];
      data.channel_links.forEach(({id, source, target}) => {
        const prev = links.findIndex(l => l.source.id === target.id && l.target.id === source.id);
        if (prev !== -1) {
          links[prev].direction = 0;
        }
        else {
          links.push({
            id,
            source,
            target,
            direction: 2
          });
        }
      })
      this.setState(update(this.state, {$merge: {links}}));
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
        direction: 0,
        links: this.state.links.concat([{
          id: `${this.state.channelR.id}:${this.state.channelL.id}`,
          source: this.state.channelL,
          target: this.state.channelR,
          direction: this.state.direction
        }])
      }
    }));
  }

  renderDNDtargets() {
    return (
      <Segment color="grey" inverted>
        <Divider vertical>
          <Icon 
            name={arrows[this.state.direction]} 
            className="cursor_pointer white"
            onClick={() => {
              this.setState(update(this.state, {
                $merge: {
                  direction: (this.state.direction + 1) % 3
                }
              }));
            }}
          />
        </Divider>
        <Grid stackable textAlign='center' columns={2} padded>
          <Grid.Row>
            <Grid.Column>
              <ChannelDropper
                channel={this.state.channelL}
                forceHighlights={this.state.forceHighlights}
                onDrop={(channel) => {
                  this.setState(update(this.state, {
                    $merge: {
                      channelL: channel
                    }
                  }));
                }}
              />
            </Grid.Column>
            <Grid.Column>
              <ChannelDropper
                channel={this.state.channelR}
                forceHighlights={this.state.forceHighlights}
                onDrop={(channel) => {
                  this.setState(update(this.state, {
                    $merge: {
                      channelR: channel
                    }
                  }));
                }}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    )
  }

  renderChannelLink(link) {
    const channelL = this.state.channels.find(channel => channel.id === link.source.id);
    const channelR = this.state.channels.find(channel => channel.id === link.target.id);
    const updateLink = (newLink) => {
      const links = JSON.parse(JSON.stringify(this.state.links));
      links[links.findIndex(l => l.id === link.id)] = newLink;
      this.setState(update(this.state, {
        $merge: {
          links
        }
      }));
    };
    return (
      <ReactHoverObserver key={link.id}>
        {({ isHovering }) => (
          <Segment color="grey" className={isHovering ? "hover": ""} inverted>
            { isHovering &&
              <Icon 
              name="times circle"
              className="cursor_pointer"
              corner="top right"
              onClick={() => {
                this.setState(update(this.state, {
                  $merge: {
                    links: this.state.links.filter(l => l.id !== link.id)
                  }
                }));
              }}
            />
            }
            <Divider vertical>
              <Icon 
                name={arrows[link.direction]}
                className="cursor_pointer white"
                onClick={() => {
                  updateLink({
                    id: `${channelL.id}:${channelR.id}`,
                    source: channelL,
                    target: channelR,
                    direction: (link.direction + 1) % 3
                  });
                }}
              />
            </Divider>
            <Grid stackable textAlign='center' columns={2} padded>
              <Grid.Row>
                <Grid.Column>
                  <ChannelDropper
                    channel={channelL}
                    forceHighlights={this.state.forceHighlights}
                    onDrop={(channel) => {
                      updateLink({
                        id: `${channel.id}:${channelR.id}`,
                        source: channel,
                        target: channelR,
                        direction: link.direction
                      });
                    }}
                  />
                </Grid.Column>
                <Grid.Column>
                  <ChannelDropper
                    channel={channelR}
                    forceHighlights={this.state.forceHighlights}
                    onDrop={(channel) => {
                      updateLink({
                        id: `${channelL.id}:${channelR.id}`,
                        source: channelL,
                        target: channel,
                        direction: link.direction
                      });
                    }}
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        )}
      </ReactHoverObserver>
    )
  }

  render() {
    return (
      <DndProvider backend={HTML5Backend}>
        <Ref innerRef={this.topRef}>
          <Grid container columns={2} >
            <Grid.Column width={4} color="grey">
              <Sticky context={this.topRef}>
                <Segment color="grey">
                  <Input
                    fluid
                    placeholder="Filter channels"
                    onChange={inp => {
                      this.setState(update(this.state, {$merge: {channelFilter: inp.target.value}}));
                    }}
                  />
                </Segment>
              </Sticky>
              <List divided relaxed inverted selection>
                {this.state.channels
                  .filter(channel =>
                    channel.name.toLowerCase().includes(this.state.channelFilter.toLowerCase()) ||
                    channel.server.name.toLowerCase().includes(this.state.channelFilter.toLowerCase())
                  ).map(channel => <Channel
                    channel={channel}
                    key={channel.id}
                    mouseClick={(forceHighlights) => {
                      this.setState(update(this.state, {$merge: {forceHighlights}}));
                    }}
                  />)
                }
              </List>
            </Grid.Column>
            <Grid.Column width={12} color="grey">
              <Sticky context={this.topRef}>
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