import React from 'react';
import {Box, Button, Flex, Heading, Text, Textarea} from 'theme-ui';
import {Socket} from 'phoenix';
import {motion} from 'framer-motion';
import ChatMessage from './ChatMessage';
import SendIcon from './SendIcon';
import * as API from '../api';
import {getCustomerId, setCustomerId} from '../storage';
import {WS_URL} from '../config';
import styles from '../styles.module.css';

const socket = new Socket(WS_URL);

// TODO:
type Message = {
  sender: string;
  body: string;
  created_at: string;
  customer_id: string;
};

type Props = {
  accountId: string;
  title?: string;
};
type State = {
  message: string;
  messages: Array<Message>;
  customerId: string;
  conversationId: string | null;
};

class ChatWidget extends React.Component<Props, State> {
  scrollToEl: any = null;

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
    socket.connect();

    this.fetchLatestConversation(this.state.customerId);
  }

  fetchLatestConversation = (customerId: string) => {
    const {accountId} = this.props;

    console.log('Fetching conversations for customer:', customerId);

    if (!customerId) {
      return this.initializeNewConversation();
    }

    return API.fetchCustomerConversations(customerId, accountId)
      .then((conversations) => {
        console.log('Found existing conversations:', conversations);

        if (!conversations || !conversations.length) {
          return this.initializeNewConversation();
        }

        const [latest] = conversations;
        const {id: conversationId, messages = []} = latest;

        this.setState({
          conversationId,
          messages: messages
            .map((msg: any) => {
              return {
                body: msg.body,
                created_at: msg.created_at,
                customer_id: msg.customer_id,
                // Deprecate
                sender: msg.customer_id ? 'customer' : 'agent',
              };
            })
            .sort(
              (a: any, b: any) =>
                +new Date(a.created_at) - +new Date(b.created_at)
            ),
        });

        return this.joinConversationChannel(conversationId);
      })
      .catch((err) => console.log('Error fetching conversations!', err));
  };

  createNewCustomerId = async (accountId: string) => {
    const {id: customerId} = await API.createNewCustomer(accountId);

    setCustomerId(customerId);

    return customerId;
  };

  initializeNewConversation = async () => {
    const {accountId} = this.props;

    const customerId = await this.createNewCustomerId(accountId);
    const {id: conversationId} = await API.createNewConversation(
      accountId,
      customerId
    );

    this.setState({customerId, conversationId, messages: []});

    this.joinConversationChannel(conversationId);
  };

  joinConversationChannel = (conversationId: string) => {
    if (this.channel && this.channel.leave) {
      this.channel.leave(); // TODO: what's the best practice here?
    }

    console.log('Joining channel:', conversationId);

    this.channel = socket.channel(`conversation:${conversationId}`, {});

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

  handleSendMessage = (e?: any) => {
    e && e.preventDefault();

    const {accountId} = this.props;
    const {message, customerId, conversationId} = this.state;

    if (!message || message.trim().length === 0) {
      return;
    }

    this.channel.push('shout', {
      body: message,
      sender: 'customer',
      // created_at: new Date(),
      conversation_id: conversationId,
      account_id: accountId,
      customer_id: customerId,
    });

    this.setState({message: ''});
  };

  render() {
    const {title = 'Welcome!'} = this.props;
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
          <Heading as='h2' sx={{color: 'white', my: 1}}>
            {title}
          </Heading>
          <Text sx={{color: 'offset'}}>
            Ask us anything in the chat window below 😊
          </Text>
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
                sx={{border: 'none', fontFamily: 'body', color: 'input'}}
                className={styles['TextArea--transparent']}
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
                <SendIcon width={16} height={16} fill='white' />
              </Button>
            </Box>
          </Flex>
        </Box>
      </Flex>
    );
  }
}

export default ChatWidget;
