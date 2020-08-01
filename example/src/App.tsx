import React from 'react';

import ChatWidget from '@papercups-io/chat-widget';

type Props = {disco?: boolean};

const App = ({disco}: Props) => {
  const colors = [
    '#1890ff',
    '#f5222d',
    '#7cb305',
    '#52c41a',
    '#13c2c2',
    '#722ed1',
    '#eb2f96',
  ];

  const [primaryColor, setPrimaryColor] = React.useState(colors[0]);

  React.useEffect(() => {
    if (!disco) {
      return;
    }

    const interval = setInterval(() => {
      const idx = colors.indexOf(primaryColor);
      const next = (idx + 1) % (colors.length - 1);

      setPrimaryColor(colors[next]);
    }, 2000);

    return () => clearInterval(interval);
  }, [disco, colors, primaryColor]);

  return (
    <>
      {/*
        Put <ChatWidget /> at the bottom of whatever pages you would
        like to render the widget on, or in your root/router component
        if you would like it to render on every page
      */}
      <ChatWidget
        title='Welcome to Papercups!'
        subtitle='Ask us anything in the chat window 😊'
        primaryColor={primaryColor}
        accountId='eb504736-0f20-4978-98ff-1a82ae60b266'
        greeting='Hi there! How can I help you?'
        customer={{
          name: 'Test User',
          email: 'test@test.com',
          external_id: '123',
        }}
        // TODO: default to point to production once that's working
        baseUrl='http://localhost:4000'
      />
    </>
  );
};

export default App;
