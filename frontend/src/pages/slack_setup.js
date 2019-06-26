import React from 'react';

import { Button, Form, Grid, Header, Image, Segment } from 'semantic-ui-react'

function SlackSetup() {
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
            <Form.Input fluid label="Bot OAuth2 Token"/>

            <Button color='purple' fluid size='large'>
              Check
            </Button>
          </Segment>
        </Form>
      </Grid.Column>
    </Grid>
  );
}

export default SlackSetup;
