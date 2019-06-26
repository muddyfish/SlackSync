import React from 'react';
import 'semantic-ui-less/semantic.less';

import DiscordSetup from './pages/discord_setup';
import SlackSetup from './pages/slack_setup';

import './App.css';

function App() {
  return (
    <div className="App">
      <SlackSetup/>
    </div>
  );
}

export default App;
