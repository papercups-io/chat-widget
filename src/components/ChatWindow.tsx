/** @jsx jsx */

import {jsx} from 'theme-ui';
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
  return (
    <ChatWidgetContainer {...props} defaultIsOpen>
      {(config) => {
        const {sandbox, iframeUrl, query, setIframeRef} = config;

        return (
          <iframe
            ref={setIframeRef}
            className='Papercups-chatWindowContainer'
            sandbox={sandbox}
            src={`${iframeUrl}?${query}`}
            sx={{
              border: 'none',
              bg: 'background',
              variant: 'styles.ChatWindowContainer',
            }}
          >
            Loading...
          </iframe>
        );
      }}
    </ChatWidgetContainer>
  );
};

export default ChatWindow;
