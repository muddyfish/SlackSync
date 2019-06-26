import React from 'react';

import { Button, Form, Grid, Header, Image, Segment } from 'semantic-ui-react'

function DiscordSetup() {
  return (
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header  as='h2' color='violet' textAlign='center'>
          <Segment stacked color='grey' inverted>
            <Image src='/Discord-Logo+Wordmark-Color.svg'/>
            Connect to Discord
          </Segment>
        </Header>
        <Form size='large'>
          <Segment stacked  color='grey' inverted>
            <Form.Input fluid label="Bot Token"/>
            <Form.Input fluid label="Client Secret"/>

            <Button color='violet' fluid size='large'>
              Check
            </Button>
          </Segment>
        </Form>
      </Grid.Column>
    </Grid>
  );
}

export default DiscordSetup;
