/** @jsx jsx */

import {jsx} from 'theme-ui';
import {motion} from 'framer-motion';

import ChatWidgetContainer, {SharedProps} from './ChatWidgetContainer';
import ErrorBoundary from './ErrorBoundary';

type Props = SharedProps & {};

const ChatWindow = (props: Props) => {
  // TODO: add a prop to `ChatWidgetContainer` to indicate when component is not
  // the widget (e.g. it is never toggled open/closed, no need to show notifications)
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default ChatWindow;
