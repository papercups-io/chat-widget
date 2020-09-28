/** @jsx jsx */

import {jsx} from 'theme-ui';
import {motion} from 'framer-motion';
import ChatWidgetContainer from './ChatWidgetContainer';
import {CustomerMetadata, Message} from '../api';

type Props = {
  title?: string;
  subtitle?: string;
  primaryColor?: string;
  accountId: string;
  baseUrl?: string;
  greeting?: string;
  customer?: CustomerMetadata | null;
  newMessagePlaceholder?: string;
  agentAvailableText?: string;
  agentUnavailableText?: string;
  showAgentAvailability?: boolean;
  iframeUrlOverride?: string;
  requireEmailUpfront?: boolean;
  customIconUrl?: string;
  onChatOpened?: () => void;
  onChatClosed?: () => void;
  onMessageSent?: (message: Message) => void;
  onMessageReceived?: (message: Message) => void;
};

const ChatWindow = (props: Props) => {
  // TODO: add a prop to `ChatWidgetContainer` to indicate when component is not
  // the widget (e.g. it is never toggled open/closed, no need to show notifications)
  return (
    <ChatWidgetContainer {...props} canToggle={false}>
      {(config) => {
        const {sandbox, isLoaded, iframeUrl, query, setIframeRef} = config;

        return (
          <motion.iframe
            ref={setIframeRef}
            className='Papercups-chatWindowContainer'
            sandbox={sandbox}
            animate={isLoaded ? 'open' : 'closed'}
            initial='closed'
            variants={{
              closed: {opacity: 0},
              open: {opacity: 1},
            }}
            transition={{duration: 0.2, ease: 'easeIn'}}
            src={`${iframeUrl}?${query}`}
            sx={{
              opacity: isLoaded ? 1 : 0,
              border: 'none',
              bg: 'background',
              variant: 'styles.ChatWindowContainer',
            }}
          >
            Loading...
          </motion.iframe>
        );
      }}
    </ChatWidgetContainer>
  );
};

export default ChatWindow;
