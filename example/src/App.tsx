import React from 'react';

import ChatWidget, {
  ChatWindow,
  toggle,
  open,
  close,
} from '@papercups-io/chat-widget';

type Props = {disco?: boolean; displayChatWindow?: boolean};

const App = ({disco, displayChatWindow}: Props) => {
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
      {displayChatWindow ? (
        <div
          style={{
            padding: 32,
            height: 480,
            width: '50%',
            minWidth: 320,
            maxWidth: 400,
          }}
        >
          <ChatWindow
            title='Welcome to Papercups!'
            subtitle='Ask us anything in the chat window 😊'
            primaryColor={primaryColor}
            accountId='eb504736-0f20-4978-98ff-1a82ae60b266'
            greeting='Hi there! How can I help you?'
            newMessagePlaceholder='Start typing...'
            agentAvailableText='Agents are online!'
            agentUnavailableText='Agents are not available at the moment.'
            customer={{
              name: 'Test User',
              email: 'test@test.com',
              external_id: '123',
              // Ad hoc metadata
              metadata: {
                plan: 'starter',
                registered_at: '2020-09-01',
                age: 25,
                valid: true,
              },
            }}
            // NB: we override these values during development -- note that the
            // API runs on port 4000 by default, and the iframe on 8080
            baseUrl='http://localhost:4000'
            iframeUrlOverride='http://localhost:8080'
            requireEmailUpfront
            showAgentAvailability
            onChatClosed={() => console.log('Chat closed!')}
            onChatOpened={() => console.log('Chat opened!')}
            onMessageReceived={(message) =>
              console.log('Message received!', message)
            }
            onMessageSent={(message) => console.log('Message sent!', message)}
          />
        </div>
      ) : (
        // Put <ChatWidget /> at the bottom of whatever pages you would
        // like to render the widget on, or in your root/router component
        // if you would like it to render on every page
        <ChatWidget
          title='Welcome to Papercups!'
          subtitle='Ask us anything in the chat window 😊'
          primaryColor={primaryColor}
          accountId='eb504736-0f20-4978-98ff-1a82ae60b266'
          greeting='Hi there! How can I help you?'
          newMessagePlaceholder='Start typing...'
          agentAvailableText='Agents are online!'
          agentUnavailableText='Agents are not available at the moment.'
          customer={{
            name: 'Test User',
            email: 'test@test.com',
            external_id: '123',
            // Ad hoc metadata
            metadata: {
              plan: 'starter',
              registered_at: '2020-09-01',
              age: 25,
              valid: true,
            },
          }}
          // NB: we override these values during development -- note that the
          // API runs on port 4000 by default, and the iframe on 8080
          baseUrl='http://localhost:4000'
          iframeUrlOverride='http://localhost:8080'
          requireEmailUpfront
          showAgentAvailability
          defaultIsOpen={false}
          onChatClosed={() => console.log('Chat closed!')}
          onChatOpened={() => console.log('Chat opened!')}
          onMessageReceived={(message) =>
            console.log('Message received!', message)
          }
          onMessageSent={(message) => console.log('Message sent!', message)}
        />
      )}

      <button onClick={open}>Open</button>
      <button onClick={close}>Close</button>
      <button onClick={toggle}>Toggle</button>
    </>
  );
};

export default App;
