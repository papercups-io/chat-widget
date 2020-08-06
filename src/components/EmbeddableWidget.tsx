/** @jsx jsx */

import React from 'react';
import {motion} from 'framer-motion';
import {ThemeProvider, jsx} from 'theme-ui';
import qs from 'query-string';
import WidgetToggle from './WidgetToggle';
import {CustomerMetadata} from '../api';
import getThemeConfig from '../theme';

const IFRAME_URL = 'https://chat-window.vercel.app';

// TODO: set this up somewhere else
const setup = (w: any, handlers: (msg?: any) => void) => {
  const cb = (msg: any) => {
    if (msg.origin !== IFRAME_URL) {
      return;
    }

    handlers(msg);
  };

  if (w.addEventListener) {
    w.addEventListener('message', cb);

    return () => w.removeEventListener('message', cb);
  } else {
    w.attachEvent('onmessage', cb);

    return () => w.detachEvent('message', cb);
  }
};

type Props = {
  title?: string;
  subtitle?: string;
  primaryColor?: string;
  accountId: string;
  baseUrl?: string;
  greeting?: string;
  customer?: CustomerMetadata;
  defaultIsOpen?: boolean;
};

const EmbeddableWidget = ({
  accountId,
  title,
  subtitle,
  primaryColor,
  baseUrl,
  greeting,
  customer,
  defaultIsOpen = false,
}: Props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const iframeRef = React.useRef(null);
  // useRef since we only want to use this for the initial values
  const query = React.useRef(
    qs.stringify({
      accountId,
      title,
      subtitle,
      primaryColor,
      baseUrl,
      greeting,
    })
  ).current;

  const theme = getThemeConfig({primary: primaryColor});

  const send = (event: string, payload?: any) => {
    console.log('Sending from parent:', {event, payload});
    const el = iframeRef.current as any;

    el.contentWindow.postMessage({event, payload}, '*');
  };

  const handleChatLoaded = () => {
    if (defaultIsOpen) {
      setIsOpen(true);
    }

    return send('papercups:ping'); // Just testing
  };

  const sendCustomerUpdate = (payload: any) => {
    const {customerId} = payload;

    return send('customer:update', {customerId, metadata: customer});
  };

  const handlers = (msg: any) => {
    console.log('Handling in parent:', msg.data);
    const {event, payload = {}} = msg.data;

    switch (event) {
      case 'chat:loaded':
        return handleChatLoaded();
      case 'conversation:join':
        return sendCustomerUpdate(payload);
      default:
        return null;
    }
  };

  React.useEffect(() => {
    const unsubscribe = setup(window, handlers);

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    send('config:update', {
      accountId,
      title,
      subtitle,
      primaryColor,
      baseUrl,
      greeting,
    });
  }, [accountId, title, subtitle, primaryColor, baseUrl, greeting]);

  const handleToggleOpen = () => setIsOpen(!isOpen);

  return (
    <ThemeProvider theme={theme}>
      {/* TODO: handle loading state better */}
      <motion.iframe
        ref={iframeRef}
        className='Papercups-chatWindowContainer'
        animate={isOpen ? 'open' : 'closed'}
        variants={{
          closed: {opacity: 0, y: 4},
          open: {opacity: 1, y: 0},
        }}
        transition={{duration: 0.2, ease: 'easeIn'}}
        src={`${IFRAME_URL}?${query}`}
        style={isOpen ? {} : {bottom: -9999}}
        sx={{
          border: 'none',
          bg: 'background',
          variant: 'styles.WidgetContainer',
        }}
      >
        Loading...
      </motion.iframe>

      <motion.div
        className='Papercups-toggleButtonContainer'
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        sx={{
          variant: 'styles.WidgetToggleContainer',
        }}
      >
        <WidgetToggle toggle={handleToggleOpen} />
      </motion.div>
    </ThemeProvider>
  );
};

export default EmbeddableWidget;
