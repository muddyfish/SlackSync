import React, {Component} from 'react';

import { Button, Form, Grid, Header, Image, Segment } from 'semantic-ui-react';

import update from 'immutability-helper';
import axios from 'axios';

const authURL = "https://slack.com/api/auth.test";
const infoURL = "https://slack.com/api/bots.info";

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
      axios.get(infoURL, { params: { 
        token: this.state.botToken,
        bot: response.data.user_id 
      }}).then(response => {
        this.setState(update(this.state, {
          $merge: {
          }
        }), () => {
          callback("");
        });
      })
    }).catch(response => {    
      callback("Invalid bot token");
    });
  }

  render () {
    return (
      <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as='h2' textAlign='center'>
            <Segment stacked color='purple' inverted>
              <Image src='/Slack_RGB_white.svg'/>
              Connect to Slack
            </Segment>
          </Header>
          <Form size='large'>
            <Segment stacked>
              <Form.Input fluid label="Bot OAuth2 Token" onChange={(event, data) => {
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
          </Form>
        </Grid.Column>
      </Grid>
    );
  }
}

export default SlackSetup;
