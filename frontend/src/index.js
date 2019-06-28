import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';

import Setup from './setup';
import ChannelLinker from './pages/channel_linker';

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={ChannelLinker}/>
          <Route exact path="/setup" component={Setup}/>
        </Switch>
      </Router>
    );
  }
}


ReactDOM.render(<App/>, document.getElementById('root'));