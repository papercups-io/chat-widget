/** @jsx jsx */

import React from 'react';
import {motion} from 'framer-motion';
import {ThemeProvider, jsx} from 'theme-ui';
import qs from 'query-string';
import WidgetToggle from './WidgetToggle';
import {CustomerMetadata} from '../api';
import getThemeConfig from '../theme';
import store from '../storage';
import {getUserInfo} from '../track/info';

// const IFRAME_URL = 'http://localhost:8080';
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
  newMessagePlaceholder?: string;
  defaultIsOpen?: boolean;
};

class EmbeddableWidget extends React.Component<Props, any> {
  iframeRef: any;
  storage: any;
  unsubscribe: any;

  constructor(props: Props) {
    super(props);

    this.state = {isOpen: false, query: ''};
  }

  componentDidMount() {
    const {
      accountId,
      title,
      subtitle,
      primaryColor,
      baseUrl,
      greeting,
      newMessagePlaceholder,
    } = this.props;

    this.unsubscribe = setup(window, this.handlers);
    this.storage = store(window);

    const query = qs.stringify({
      accountId,
      title,
      subtitle,
      primaryColor,
      baseUrl,
      greeting,
      newMessagePlaceholder,
      customerId: this.storage.getCustomerId(),
    });

    this.setState({query});
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  componentDidUpdate(prevProps: Props) {
    const {
      accountId,
      title,
      subtitle,
      primaryColor,
      baseUrl,
      greeting,
      newMessagePlaceholder,
    } = this.props;
    const current = [
      accountId,
      title,
      subtitle,
      primaryColor,
      baseUrl,
      greeting,
      newMessagePlaceholder,
    ];
    const prev = [
      prevProps.accountId,
      prevProps.title,
      prevProps.subtitle,
      prevProps.primaryColor,
      prevProps.baseUrl,
      prevProps.greeting,
      prevProps.newMessagePlaceholder,
    ];
    const shouldUpdate = current.some((value, idx) => {
      return value !== prev[idx];
    });

    // Send updates to iframe if props change. (This is mainly for use in
    // the demo and "Getting Started" page, where users can play around with
    // customizing the chat widget to suit their needs)
    if (shouldUpdate) {
      this.send('config:update', {
        accountId,
        title,
        subtitle,
        primaryColor,
        baseUrl,
        greeting,
        newMessagePlaceholder,
      });
    }
  }

  handlers = (msg: any) => {
    console.log('Handling in parent:', msg.data);
    const {event, payload = {}} = msg.data;

    switch (event) {
      case 'chat:loaded':
        return this.handleChatLoaded();
      case 'customer:created':
        return this.handleCacheCustomerId(payload);
      case 'conversation:join':
        return this.sendCustomerUpdate(payload);
      default:
        return null;
    }
  };

  send = (event: string, payload?: any) => {
    console.log('Sending from parent:', {event, payload});
    const el = this.iframeRef as any;

    el.contentWindow.postMessage({event, payload}, '*');
  };

  handleChatLoaded = () => {
    if (this.props.defaultIsOpen) {
      this.setState({isOpen: true});
    }

    return this.send('papercups:ping'); // Just testing
  };

  sendCustomerUpdate = (payload: any) => {
    const {customerId} = payload;
    const customerBrowserInfo = getUserInfo(window);
    const metadata = {...customerBrowserInfo, ...this.props.customer};

    return this.send('customer:update', {customerId, metadata});
  };

  handleCacheCustomerId = (payload: any) => {
    const {customerId} = payload;

    return this.storage.setCustomerId(customerId);
  };

  handleToggleOpen = () => {
    this.setState({isOpen: !this.state.isOpen});
  };

  render() {
    const {primaryColor} = this.props;
    const {isOpen, query} = this.state;

    if (!query) {
      return null;
    }

    const theme = getThemeConfig({primary: primaryColor});

    return (
      <ThemeProvider theme={theme}>
        {/* TODO: handle loading state better */}
        <motion.iframe
          ref={(el) => (this.iframeRef = el)}
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
          <WidgetToggle toggle={this.handleToggleOpen} />
        </motion.div>
      </ThemeProvider>
    );
  }
}

export default EmbeddableWidget;
