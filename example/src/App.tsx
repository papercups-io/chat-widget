import React from 'react';

import {ChatWidget, ChatWindow} from '@papercups-io/chat-widget';
import {Papercups} from '@papercups-io/browser';

// NB: during development, replace this with valid account/inbox IDs from your dev db
const TEST_ACCOUNT_ID = '2ebbad4c-b162-4ed2-aff5-eaf9ebf469a5';
const TEST_INBOX_ID = 'eab9c66e-ea8a-46f7-9565-3927ec55e20d';

const cups = Papercups.init({
  accountId: TEST_ACCOUNT_ID,
  inboxId: TEST_INBOX_ID,
  baseUrl: 'http://localhost:4000',
});

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
  const [customer, setCustomerDetails] = React.useState<any>(null);

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

  const handleIdentifyCustomer = () => {
    const params = {
      name: 'Demo User',
      email: 'demo@papercups.io',
      external_id: '789:demo@papercups.io',
      // Ad hoc metadata
      metadata: {
        plan: 'team',
        registered_at: '2020-09-01',
        age: 30,
        valid: true,
      },
    };

    cups.identify('789:demo@papercups.io', params);
    setCustomerDetails(params);
  };

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
            token={TEST_ACCOUNT_ID}
            inbox={TEST_INBOX_ID}
            // deprecate `accountId`, use `token` instead
            accountId={TEST_ACCOUNT_ID}
            title='Welcome to Papercups!'
            subtitle='Ask us anything in the chat window 😊'
            primaryColor={primaryColor}
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
            onChatLoaded={() => console.log('Chat loaded!')}
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
          token={TEST_ACCOUNT_ID}
          inbox={TEST_INBOX_ID}
          // deprecate `accountId`, use `token` instead
          accountId={TEST_ACCOUNT_ID}
          title='Welcome to Papercups!'
          subtitle='Ask us anything in the chat window 😊'
          primaryColor={primaryColor}
          greeting='Hi there! How can I help you?'
          awayMessage="Sorry, we're not available at the moment! Leave your email and we'll get back to you as soon as we can :)"
          newMessagePlaceholder='Start typing...'
          emailInputPlaceholder='What is your email address?'
          newMessagesNotificationText='View new messages'
          agentAvailableText='Agents are online!'
          agentUnavailableText='Agents are not available at the moment.'
          // customer={customer}
          // NB: we override these values during development -- note that the
          // API runs on port 4000 by default, and the iframe on 8080
          baseUrl='http://localhost:4000'
          iframeUrlOverride='http://localhost:8080'
          requireEmailUpfront={!customer && !customer?.email}
          showAgentAvailability
          hideOutsideWorkingHours={false}
          hideToggleButton={false}
          popUpInitialMessage={1000}
          isOpenByDefault
          iconVariant='filled'
          persistOpenState
          // position={{side: 'right', offset: 80}}
          debug
          disableAnalyticsTracking
          styles={{
            chatContainer: {
              // left: 20,
              // right: 'auto',
              // bottom: 160,
              // maxHeight: 640,
            },
            toggleContainer: {
              // left: 20,
              // right: 'auto',
              // bottom: 80,
            },
            toggleButton: {},
          }}
          // renderToggleButton={({isOpen, onToggleOpen}) => (
          //   <button onClick={onToggleOpen}>{isOpen ? 'Close' : 'Open'}</button>
          // )}
          onChatLoaded={({open, close, identify}) =>
            console.log('Chat loaded!', {open, close, identify})
          }
          onChatClosed={() => console.log('Chat closed!')}
          onChatOpened={() => console.log('Chat opened!')}
          onMessageReceived={(message) =>
            console.log('Message received!', message)
          }
          onMessageSent={(message) => console.log('Message sent!', message)}
          setDefaultGreeting={(settings) => {
            const shouldDisplayAwayMessage = !!settings?.account
              ?.is_outside_working_hours;

            return shouldDisplayAwayMessage
              ? "We're away at the moment, but we'll be back on Monday!"
              : 'Hi there! How can I help you?';
          }}
        />
      )}

      <button onClick={Papercups.open}>Open</button>
      <button onClick={Papercups.close}>Close</button>
      <button onClick={Papercups.toggle}>Toggle</button>
      <button onClick={handleIdentifyCustomer}>
        {customer && customer.email ? 'Logged in' : 'Log in'}
      </button>
    </>
  );
};

export default App;
