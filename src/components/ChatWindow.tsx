import React from 'react';
import {Box, Button, Flex, Heading, Text, Textarea} from 'theme-ui';
import {Socket} from 'phoenix';
import {motion} from 'framer-motion';
import ChatMessage from './ChatMessage';
import SendIcon from './SendIcon';
import * as API from '../api';
import {Message, now} from '../utils';
import {getCustomerId, setCustomerId} from '../storage';
import {getWebsocketUrl} from '../config';

type Props = {
  accountId: string;
  title?: string;
  subtitle?: string;
  baseUrl?: string;
  greeting?: string;
};

type State = {
  message: string;
  messages: Array<Message>;
  customerId: string;
  conversationId: string | null;
};

class ChatWindow extends React.Component<Props, State> {
  scrollToEl: any = null;

  socket: any;
  channel: any;

  state: State = {
    message: '',
    messages: [],
    // TODO: figure out how to determine these, either by IP or localStorage
    // (eventually we will probably use cookies for this)
    customerId: getCustomerId(),
    conversationId: null,
  };

  componentDidMount() {
    const websocketUrl = getWebsocketUrl(this.props.baseUrl);

    this.socket = new Socket(websocketUrl);
    this.socket.connect();

    this.fetchLatestConversation(this.state.customerId);
  }

  componentWillUnmount() {
    this.channel && this.channel.leave();
  }

  getDefaultGreeting = (): Array<Message> => {
    const {greeting} = this.props;

    if (!greeting) {
      return [];
    }

    return [
      {
        sender: 'agent', // bot?
        body: greeting, // 'Hi there! How can I help you?',
        created_at: now().toString(),
      },
    ];
  };

  fetchLatestConversation = (customerId: string) => {
    if (!customerId) {
      // If there's no customerId, we haven't seen this customer before,
      // so do nothing until they try to create a new message
      this.setState({messages: [...this.getDefaultGreeting()]});

      return;
    }

    const {accountId, baseUrl} = this.props;

    console.log('Fetching conversations for customer:', customerId);

    return API.fetchCustomerConversations(customerId, accountId, baseUrl)
      .then((conversations) => {
        console.log('Found existing conversations:', conversations);

        if (!conversations || !conversations.length) {
          // If there are no conversations yet, wait until the customer creates
          // a new message to create the new conversation
          this.setState({messages: [...this.getDefaultGreeting()]});

          return;
        }

        const [latest] = conversations;
        const {id: conversationId, messages = []} = latest;
        const formattedMessages = messages
          .map((msg: Message) => {
            return {
              ...msg,
              // Deprecate
              sender: msg.customer_id ? 'customer' : 'agent',
            };
          })
          .sort(
            (a: Message, b: Message) =>
              +new Date(a.created_at) - +new Date(b.created_at)
          );

        this.setState({
          conversationId,
          messages: [...this.getDefaultGreeting(), ...formattedMessages],
        });

        return this.joinConversationChannel(conversationId);
      })
      .catch((err) => console.log('Error fetching conversations!', err));
  };

  createNewCustomerId = async (accountId: string) => {
    const {baseUrl} = this.props;
    const {id: customerId} = await API.createNewCustomer(accountId, baseUrl);

    setCustomerId(customerId);

    return customerId;
  };

  initializeNewConversation = async () => {
    const {accountId, baseUrl} = this.props;

    const customerId = await this.createNewCustomerId(accountId);
    const {id: conversationId} = await API.createNewConversation(
      accountId,
      customerId,
      baseUrl
    );

    this.setState({customerId, conversationId});

    this.joinConversationChannel(conversationId, customerId);

    return {customerId, conversationId};
  };

  joinConversationChannel = (conversationId: string, customerId?: string) => {
    if (this.channel && this.channel.leave) {
      this.channel.leave(); // TODO: what's the best practice here?
    }

    console.log('Joining channel:', conversationId);

    this.channel = this.socket.channel(`conversation:${conversationId}`, {
      customer_id: customerId,
    });

    this.channel.on('shout', (message: any) => {
      this.handleNewMessage(message);
    });

    this.channel
      .join()
      .receive('ok', (res: any) => {
        console.log('Joined successfully!', res);
      })
      .receive('error', (err: any) => {
        console.log('Unable to join!', err);
      });

    this.scrollToEl.scrollIntoView();
  };

  handleNewMessage = (message: Message) => {
    this.setState({messages: [...this.state.messages, message]}, () => {
      this.scrollToEl.scrollIntoView();
    });
  };

  handleMessageChange = (e: any) => {
    this.setState({message: e.target.value});
  };

  handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      this.handleSendMessage(e);
    }
  };

  handleSendMessage = async (e?: any) => {
    e && e.preventDefault();

    const {message, customerId, conversationId} = this.state;

    if (!message || message.trim().length === 0) {
      return;
    }

    if (!customerId || !conversationId) {
      await this.initializeNewConversation();
    }

    if (!this.channel) {
      return;
    }

    this.channel.push('shout', {
      body: message,
      customer_id: this.state.customerId,
      sender: 'customer', // TODO: remove?
    });

    this.setState({message: ''});
  };

  render() {
    const {title = 'Welcome!', subtitle = 'How can we help you?'} = this.props;
    const {customerId, message, messages = []} = this.state;

    return (
      <Flex
        sx={{
          bg: 'background',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
        }}
      >
        <Box py={3} px={4} sx={{bg: 'primary'}}>
          <Heading as='h2' sx={{color: 'background', my: 1}}>
            {title}
          </Heading>
          <Text sx={{color: 'offset'}}>{subtitle}</Text>
        </Box>
        <Box
          p={3}
          sx={{
            flex: 1,
            boxShadow: 'rgba(0, 0, 0, 0.2) 0px 21px 4px -20px inset',
            overflowY: 'scroll',
          }}
        >
          {messages.map((msg, key) => {
            // Slight hack
            const next = messages[key + 1];
            const isLastInGroup = next
              ? msg.customer_id !== next.customer_id
              : true;
            const shouldDisplayTimestamp = key === messages.length - 1;
            const isMe = msg.customer_id === customerId;

            return (
              <motion.div
                key={key}
                initial={{opacity: 0, x: isMe ? 2 : -2}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: 0.2, ease: 'easeIn'}}
              >
                <ChatMessage
                  key={key}
                  message={msg}
                  isMe={isMe}
                  isLastInGroup={isLastInGroup}
                  shouldDisplayTimestamp={shouldDisplayTimestamp}
                />
              </motion.div>
            );
          })}
          <div ref={(el) => (this.scrollToEl = el)} />
        </Box>
        <Box
          p={2}
          sx={{
            borderTop: '1px solid rgb(230, 230, 230)',
            // TODO: only show shadow on focus TextArea below
            boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 100px 0px',
          }}
        >
          <Flex sx={{alignItems: 'center'}}>
            <Box mr={3} sx={{flex: 1}}>
              <Textarea
                sx={{
                  fontFamily: 'body',
                  color: 'input',
                  variant: 'styles.textarea.transparent',
                }}
                className='TextArea--transparent'
                placeholder='Start typing...'
                rows={1}
                autoFocus
                value={message}
                onKeyDown={this.handleKeyDown}
                onChange={this.handleMessageChange}
              />
            </Box>
            <Box pl={3}>
              <Button
                variant='primary'
                type='submit'
                onClick={this.handleSendMessage}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '50%',
                  height: '36px',
                  width: '36px',
                  padding: 0,
                }}
              >
                <SendIcon width={16} height={16} fill='background' />
              </Button>
            </Box>
          </Flex>
        </Box>
      </Flex>
    );
  }
}

export default ChatWindow;
