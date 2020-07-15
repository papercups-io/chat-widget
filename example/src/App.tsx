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
      <ChatWidget accountId='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx' />;
    </>
  );
};

export default App;
