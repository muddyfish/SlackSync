import React, {Component} from 'react';

import { Button, Form, Grid, Header, Image, Segment, Label } from 'semantic-ui-react';

import update from 'immutability-helper';
import axios from 'axios';

const authURL = "https://slack.com/api/auth.test";
const infoURL = "https://slack.com/api/users.info";

class SlackSetup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      botToken: "",
      loading: false,
      statusMessage: "",
      avatarUrl: "",
      botUsername: ""
    }
  }
  
  slackLogin(callback) {
    axios.get(authURL, { params: { token: this.state.botToken }}).then(response => {
      if (!response.data.ok) {
        return callback("Invalid bot token");
      }
      axios.get(infoURL, { params: { 
        token: this.state.botToken,
        user: response.data.user_id 
      }}).then(response => {
        this.setState(update(this.state, {
          $merge: {
            botUsername: response.data.user.name,
            avatarUrl: response.data.user.profile.image_72
          }
        }), () => {
          callback("");
        });
      })
    });
  }

  render () {
    return (
      <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as='h2' textAlign='center'>
            <Segment.Group stacked>
              <Segment stacked color='purple' inverted>
                <Image src='/Slack_RGB_white.svg'/>
              </Segment>
              { this.state.botUsername === "" && 
                <Segment>
                  Connect to Slack
                </Segment>
              }
              { this.state.botUsername !== "" && 
                <Segment>
                  <Image src={this.state.avatarUrl} size='tiny' circular verticalAlign='middle' spaced='right'/>
                  { this.state.botUsername }
                </Segment>
              }
              { this.state.statusMessage &&               
                <Segment>
                  <Label color="red">
                    { this.state.statusMessage }
                  </Label>
                </Segment>
              }
            </Segment.Group>
          </Header>
          <Form size='large'>
            { this.state.botUsername === "" &&
              <Segment stacked>
                <Form.Input fluid label="Bot OAuth2 Token" type="password" onChange={(event, data) => {
                    this.setState(update(this.state, {
                        $merge: {botToken: data.value}
                      }));
                  }}
                />
                <Button color='purple' fluid size='large' onClick={() => {
                  if (this.state.loading) {
                    return
                  }
                  this.setState(update(this.state, {
                    $merge: {loading: true}
                  }), () => {
                    this.slackLogin((status) => {
                      this.setState(update(this.state, {
                        $merge: {
                          loading: false,
                          statusMessage: status
                        }
                      }));
                    });
                  });
                }}>
                  Check
                </Button>
              </Segment>
            }
            { this.state.botUsername !== "" && 
              <Segment>
                <Button color='purple' fluid size='large' attached='top' onClick={() => {
                  }}
                >
                  Continue
                </Button>
                <Button color='purple' fluid size='large' attached='bottom' onClick={() => {
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
    );
  }
}

export default SlackSetup;
