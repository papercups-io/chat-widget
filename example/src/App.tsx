import React from 'react';

import ChatWidget from '@papercups-io/chat-widget';
import '@papercups-io/chat-widget/dist/index.css';

const App = () => {
  return (
    <>
      {/*
        Put <ChatWidget /> at the bottom of whatever pages you would
        like to render the widget on, or in your root/router component
        if you would like it to render on every page
      */}
      <ChatWidget
        title='Welcome to Papercups!'
        accountId='eb504736-0f20-4978-98ff-1a82ae60b266'
      />
    </>
  );
};

export default App;
