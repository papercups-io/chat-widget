import React from 'react';
import {Box, Button, Flex, Heading, Text, Textarea} from 'theme-ui';
import {Socket} from 'phoenix';
import {motion} from 'framer-motion';
import ChatMessage from './ChatMessage';
import SendIcon from './SendIcon';
import * as API from '../api';
import {now} from '../utils';
import store from '../storage';
import {getWebsocketUrl} from '../config';

type Props = {
  accountId: string;
  title?: string;
  subtitle?: string;
  baseUrl?: string;
  greeting?: string;
  customer?: API.CustomerMetadata;
};

type State = {
  message: string;
  messages: Array<API.Message>;
  customerId: string | null;
  conversationId: string | null;
  isSending: boolean;
};

class ChatWindow extends React.Component<Props, State> {
  scrollToEl: any = null;

  socket: any;
  channel: any;
  storage: any;

  state: State = {
    message: '',
    messages: [],
    // TODO: figure out how to determine these, either by IP or localStorage
    // (eventually we will probably use cookies for this)
    customerId: null,
    conversationId: null,
    isSending: false,
  };

  componentDidMount() {
    const websocketUrl = getWebsocketUrl(this.props.baseUrl);

    this.storage = store(window);
    this.socket = new Socket(websocketUrl);
    this.socket.connect();

    const customerId = this.storage.getCustomerId();

    this.setState({customerId}, () => {
      this.fetchLatestConversation(customerId);
    });
  }

  componentWillUnmount() {
    this.channel && this.channel.leave();
  }

  getDefaultGreeting = (): Array<API.Message> => {
    const {greeting} = this.props;

    if (!greeting) {
      return [];
    }

    return [
      {
        type: 'bot',
        body: greeting, // 'Hi there! How can I help you?',
        created_at: now().toString(),
      },
    ];
  };

  fetchLatestConversation = async (customerId: string) => {
    if (!customerId) {
      // If there's no customerId, we haven't seen this customer before,
      // so do nothing until they try to create a new message
      this.setState({messages: [...this.getDefaultGreeting()]});

      return;
    }

    const {accountId, baseUrl, customer: metadata} = this.props;

    console.debug('Fetching conversations for customer:', customerId);

    try {
      const conversations = await API.fetchCustomerConversations(
        customerId,
        accountId,
        baseUrl
      );

      console.debug('Found existing conversations:', conversations);

      if (!conversations || !conversations.length) {
        // If there are no conversations yet, wait until the customer creates
        // a new message to create the new conversation
        this.setState({messages: [...this.getDefaultGreeting()]});

        return;
      }

      const [latest] = conversations;
      const {id: conversationId, messages = []} = latest;
      const formattedMessages = messages.sort(
        (a: API.Message, b: API.Message) =>
          +new Date(a.created_at) - +new Date(b.created_at)
      );

      this.setState({
        conversationId,
        messages: [...this.getDefaultGreeting(), ...formattedMessages],
      });

      this.joinConversationChannel(conversationId, customerId);

      await this.updateExistingCustomer(customerId, metadata);
    } catch (err) {
      console.debug('Error fetching conversations!', err);
    }
  };

  createNewCustomerId = async (accountId: string) => {
    const {baseUrl, customer: metadata} = this.props;
    const {id: customerId} = await API.createNewCustomer(
      accountId,
      metadata,
      baseUrl
    );

    this.storage.setCustomerId(customerId);

    return customerId;
  };

  updateExistingCustomer = async (
    customerId: string,
    metadata?: API.CustomerMetadata
  ) => {
    if (!metadata) {
      return;
    }

    try {
      const {baseUrl} = this.props;

      await API.updateCustomerMetadata(customerId, metadata, baseUrl);
    } catch (err) {
      console.debug('Error updating customer metadata!', err);
    }
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

    console.debug('Joining channel:', conversationId);

    this.channel = this.socket.channel(`conversation:${conversationId}`, {
      customer_id: customerId,
    });

    this.channel.on('shout', (message: any) => {
      this.handleNewMessage(message);
    });

    this.channel
      .join()
      .receive('ok', (res: any) => {
        console.debug('Joined successfully!', res);
      })
      .receive('error', (err: any) => {
        console.debug('Unable to join!', err);
      });

    this.scrollToEl.scrollIntoView();
  };

  handleNewMessage = (message: API.Message) => {
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

    const {message, customerId, conversationId, isSending} = this.state;

    if (isSending || !message || message.trim().length === 0) {
      return;
    }

    this.setState({isSending: true});

    if (!customerId || !conversationId) {
      await this.initializeNewConversation();
    }

    // We should never hit this block, just adding to satisfy TypeScript
    if (!this.channel) {
      this.setState({isSending: false});

      return;
    }

    this.channel.push('shout', {
      body: message,
      customer_id: this.state.customerId,
    });

    this.setState({message: '', isSending: false});
  };

  render() {
    const {title = 'Welcome!', subtitle = 'How can we help you?'} = this.props;
    const {customerId, message, messages = [], isSending} = this.state;

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
          <Heading
            as='h2'
            className='Papercups-heading'
            sx={{color: 'background', my: 1}}
          >
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
                disabled={isSending}
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
        <img
          src='https://papercups.s3.us-east-2.amazonaws.com/papercups-logo.svg'
          width='0'
          height='0'
        />
      </Flex>
    );
  }
}

export default ChatWindow;
