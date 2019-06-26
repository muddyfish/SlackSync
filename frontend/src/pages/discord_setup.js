import React, {Component} from 'react';
import { Button, Form, Grid, Header, Image, Segment, Label } from 'semantic-ui-react'

import update from 'immutability-helper';
import axios from 'axios';
import queryString from 'querystring';

const apiURL = "https://discordapp.com/api/v6/users/@me";
const oauthCheckURL = "https://discordapp.com/api/v6/oauth2/token";

class DiscordSetup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      botToken: "",
      clientSecret: "",
      loading: false,
      statusMessage: "",
      avatarUrl: "",
      botUsername: ""
    }
  }

  discordLogin(callback) {
    axios.get(apiURL, { headers: { Authorization: `Bot ${this.state.botToken}` }}).then(response => {
      axios.post(oauthCheckURL, queryString.stringify({
          client_id: atob(this.state.botToken.split(".", 1)[0]),
          client_secret: this.state.clientSecret,
          grant_type: "client_credentials",
          scope: "identify"
        }),
        {headers: {"Content-Type": "application/x-www-form-urlencoded"}}
      ).then(_ => {
        this.setState(update(this.state, {
          $merge: {
            botUsername: response.data.username,
            avatarUrl: this.getAvatarURL(response.data)
          }
        }), () => {
          callback("");
        });
      }).catch(response => {
        callback("Invalid client secret");
      });
    }).catch(response => {    
      callback("Invalid bot token");
    });
  }

  getAvatarURL(botData) {
    if (botData.avatar) {
      return `https://cdn.discordapp.com/avatars/${botData.id}/${botData.avatar}.png`
    }
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(botData.discriminator) % 5}.png`
  }

  render() {
    return (
      <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as='h2' color='violet' textAlign='center'>
            <Segment.Group stacked>
              <Segment color='grey' inverted>
                <Image src='/Discord-Logo+Wordmark-Color.svg'/>
              </Segment>
              { this.state.botUsername === "" && [
                <Segment key="connect" color='grey' inverted>
                  Connect to Discord
                </Segment>,
                <Segment key="portal" color='grey' inverted>
                  <Button color='violet' onClick={() => {
                    window.open("https://discordapp.com/developers/applications/", '_blank').focus();
                  }}>
                    Open Developer Portal
                  </Button>
                </Segment>
              ]}
              { this.state.botUsername !== "" && 
                <Segment color='grey' inverted>
                  <Image src={this.state.avatarUrl} size='tiny' circular verticalAlign='middle' spaced='right'/>
                  { this.state.botUsername }
                </Segment>
              }
              { this.state.statusMessage &&               
                <Segment color='grey' inverted>
                  <Label color="red">
                    { this.state.statusMessage }
                  </Label>
                </Segment>
              }
            </Segment.Group>
          </Header>
          <Form size='large'>
            { this.state.botUsername === "" && 
              <Segment stacked color='grey' inverted>
                <Form.Input fluid label="Bot Token" type="password" onChange={(event, data) => {
                  this.setState(update(this.state, {
                      $merge: {botToken: data.value}
                    }));
                }}/>
                <Form.Input fluid label="Client Secret" type="password" onChange={(event, data) => {
                  this.setState(update(this.state, {
                      $merge: {clientSecret: data.value}
                    }));
                }}/>
                <Button 
                  color='violet'
                  fluid 
                  size='large' 
                  onClick={() => {
                    if (this.state.loading) {
                      return
                    }
                    this.setState(update(this.state, {
                      $merge: {loading: true}
                    }), () => {
                      this.discordLogin((status) => {
                        this.setState(update(this.state, {
                          $merge: {
                            loading: false,
                            statusMessage: status
                          }
                        }));
                      });
                    });
                  }}
                  className={this.state.loading? "loading": ""}
                  disabled={this.state.botToken === "" || this.state.clientSecret === ""}
                >
                  Check
                </Button>
              </Segment>
            }
            { this.state.botUsername !== "" && 
              <Segment>
                <Button color='violet' fluid size='large' attached='top' onClick={() => {
                    this.props.callback({
                      botToken: this.state.botToken,
                      clientSecret: this.state.clientSecret
                    });
                  }}
                >
                  Continue
                </Button>
                <Button color='violet' fluid size='large' attached='bottom' onClick={() => {
                    this.setState(update(this.state, {
                      $merge: {
                        botToken: "",
                        clientSecret: "",
                        avatarUrl: "",
                        botUsername: ""
                      }
                    }));
                  }}
                >
                  Use a different account
                </Button>
              </Segment>
            }
          </Form>
        </Grid.Column>
      </Grid>
    )
  }
}

export default DiscordSetup;
