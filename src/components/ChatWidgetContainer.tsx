/** @jsx jsx */

import React from 'react';
import {ThemeProvider, jsx} from 'theme-ui';
import qs from 'query-string';
import {
  CustomerMetadata,
  Message,
  WidgetSettings,
  fetchWidgetSettings,
  updateWidgetSettingsMetadata,
} from '../api';
import {WidgetConfig, noop} from '../utils';
import getThemeConfig from '../theme';
import store from '../storage';
import {isDev} from '../config';
import Logger from '../logger';
import {getUserInfo} from '../track/info';

const DEFAULT_IFRAME_URL = 'https://chat-widget.papercups.io';

// TODO: set this up somewhere else
const setupPostMessageHandlers = (w: any, handlers: (msg?: any) => void) => {
  const cb = (msg: any) => {
    handlers(msg);
  };

  if (w.addEventListener) {
    w.addEventListener('message', cb);

    return () => w.removeEventListener('message', cb);
  } else {
    w.attachEvent('onmessage', cb);

    return () => w.detachEvent('onmessage', cb);
  }
};

const setupCustomEventHandlers = (
  w: any,
  events: Array<string>,
  handlers: (e: any) => void
) => {
  if (w.addEventListener) {
    for (const event of events) {
      w.addEventListener(event, handlers);
    }

    return () => events.map((event) => w.removeEventListener(event, handlers));
  } else {
    console.error('Custom events are not supported in your browser!');

    return noop;
  }
};

export type SharedProps = {
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
  onChatLoaded?: () => void;
  onChatOpened?: () => void;
  onChatClosed?: () => void;
  onMessageSent?: (message: Message) => void;
  onMessageReceived?: (message: Message) => void;
};

type Props = SharedProps & {
  defaultIsOpen?: boolean;
  canToggle?: boolean;
  children: (data: any) => any;
};

type State = {
  isOpen: boolean;
  isLoaded: boolean;
  query: string;
  config: WidgetConfig;
  shouldDisplayNotifications: boolean;
  isTransitioning: boolean;
};

class ChatWidgetContainer extends React.Component<Props, State> {
  iframeRef: any;
  storage: any;
  subscriptions: Array<() => void> = [];
  logger: Logger;

  EVENTS = [
    'papercups:open',
    'papercups:close',
    'papercups:toggle',
    'papercups:identify',
    'storytime:customer:set',
  ];

  constructor(props: Props) {
    super(props);

    this.state = {
      isOpen: false,
      isLoaded: false,
      query: '',
      config: {} as WidgetConfig,
      shouldDisplayNotifications: false,
      isTransitioning: false,
    };
  }

  async componentDidMount() {
    // TODO: use `subscription_plan` from settings.account to determine
    // whether to display the Papercups branding or not in the chat window
    const settings = await this.fetchWidgetSettings();
    const {
      accountId,
      title,
      subtitle,
      primaryColor,
      baseUrl,
      greeting,
      newMessagePlaceholder,
      agentAvailableText,
      agentUnavailableText,
      showAgentAvailability,
      requireEmailUpfront,
      canToggle,
      customer = {},
    } = this.props;
    // TODO: make it possible to opt into debug mode via props
    const debugModeEnabled = isDev(window);

    this.logger = new Logger(debugModeEnabled);
    this.subscriptions = [
      setupPostMessageHandlers(window, this.postMessageHandlers),
      setupCustomEventHandlers(window, this.EVENTS, this.customEventHandlers),
    ];

    this.storage = store(window);

    const metadata = {...getUserInfo(window), ...customer};
    const config: WidgetConfig = {
      accountId,
      baseUrl,
      agentAvailableText,
      agentUnavailableText,
      title: title || settings.title,
      subtitle: subtitle || settings.subtitle,
      primaryColor: primaryColor || settings.color,
      greeting: greeting || settings.greeting,
      newMessagePlaceholder:
        newMessagePlaceholder || settings.new_message_placeholder,
      companyName: settings?.account?.company_name,
      requireEmailUpfront: requireEmailUpfront ? 1 : 0,
      showAgentAvailability: showAgentAvailability ? 1 : 0,
      closeable: canToggle ? 1 : 0,
      customerId: this.storage.getCustomerId(),
      subscriptionPlan: settings?.account?.subscription_plan,
      metadata: JSON.stringify(metadata),
      version: '1.1.1',
    };

    const query = qs.stringify(config, {skipEmptyString: true, skipNull: true});

    this.setState({config, query});

    // Set some metadata on the widget to better understand usage
    await this.updateWidgetSettingsMetadata();
  }

  componentWillUnmount() {
    this.subscriptions.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
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
      this.handleConfigUpdated({
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

  setIframeRef = (el: HTMLIFrameElement) => {
    this.iframeRef = el;
  };

  getIframeUrl = () => {
    return this.props.iframeUrlOverride || DEFAULT_IFRAME_URL;
  };

  handleConfigUpdated = (updates: WidgetConfig) => {
    this.setState({
      config: {
        ...this.state.config,
        ...updates,
      },
    });

    this.send('config:update', updates);
  };

  handleCustomerIdUpdated = (id?: any) => {
    const cachedCustomerId = this.storage.getCustomerId();
    const customerId = id || cachedCustomerId;
    const config = {...this.state.config, customerId};

    // TODO: this is a slight hack to force a refresh of the chat window
    this.setState({
      config,
      query: qs.stringify(config, {skipEmptyString: true, skipNull: true}),
    });

    this.logger.debug('Updated customer ID:', customerId);
  };

  fetchWidgetSettings = () => {
    const {accountId, baseUrl} = this.props;
    const empty = {} as WidgetSettings;

    return fetchWidgetSettings(accountId, baseUrl)
      .then((settings) => settings || empty)
      .catch(() => empty);
  };

  updateWidgetSettingsMetadata = () => {
    const {accountId, baseUrl} = this.props;
    const metadata = getUserInfo(window);

    return updateWidgetSettingsMetadata(accountId, metadata, baseUrl).catch(
      (err) => {
        // No need to block on this
        this.logger.error('Failed to update widget metadata:', err);
      }
    );
  };

  customEventHandlers = (event: any) => {
    if (!event || !event.type) {
      return null;
    }

    const {type, detail} = event;

    switch (type) {
      case 'papercups:open':
        return this.handleOpenWidget();
      case 'papercups:close':
        return this.handleCloseWidget();
      case 'papercups:toggle':
        return this.handleToggleOpen();
      case 'storytime:customer:set':
        return this.handleCustomerIdUpdated(detail); // TODO: test this!
      default:
        return null;
    }
  };

  postMessageHandlers = (msg: any) => {
    this.logger.debug('Handling in parent:', msg.data);
    const iframeUrl = this.getIframeUrl();
    const {origin} = new URL(iframeUrl);

    if (msg.origin !== origin) {
      return null;
    }

    const {event, payload = {}} = msg.data;

    switch (event) {
      case 'chat:loaded':
        return this.handleChatLoaded();
      case 'customer:created':
      case 'customer:updated':
        return this.handleCacheCustomerId(payload);
      case 'conversation:join':
        return this.sendCustomerUpdate(payload);
      case 'message:received':
        return this.handleMessageReceived(payload);
      case 'message:sent':
        return this.handleMessageSent(payload);
      case 'messages:unseen':
        return this.handleUnseenMessages(payload);
      case 'messages:seen':
        return this.handleMessagesSeen();
      case 'papercups:open':
      case 'papercups:close':
        return this.handleToggleOpen();
      default:
        return null;
    }
  };

  send = (event: string, payload?: any) => {
    this.logger.debug('Sending from parent:', {event, payload});
    const el = this.iframeRef as any;

    if (!el) {
      throw new Error(
        `Attempted to send event ${event} with payload ${JSON.stringify(
          payload
        )} before iframeRef was ready`
      );
    }

    el.contentWindow.postMessage({event, payload}, this.getIframeUrl());
  };

  handleMessageReceived = (message: Message) => {
    const {onMessageReceived = noop} = this.props;
    const {user_id: userId, customer_id: customerId} = message;
    const isFromAgent = !!userId && !customerId;

    // Only invoke callback if message is from agent, because we currently track
    // `message:received` events to know if a message went through successfully
    if (isFromAgent) {
      onMessageReceived && onMessageReceived(message);
    }
  };

  handleMessageSent = (message: Message) => {
    const {onMessageSent = noop} = this.props;

    onMessageSent && onMessageSent(message);
  };

  handleUnseenMessages = (payload: any) => {
    this.logger.debug('Handling unseen messages:', payload);

    this.setState({shouldDisplayNotifications: true});
    this.send('notifications:display', {shouldDisplayNotifications: true});
  };

  handleMessagesSeen = () => {
    this.logger.debug('Handling messages seen');

    this.setState({shouldDisplayNotifications: false});
    this.send('notifications:display', {shouldDisplayNotifications: false});
  };

  handleChatLoaded = () => {
    this.setState({isLoaded: true});

    const {config = {} as WidgetConfig} = this.state;
    const {subscriptionPlan = null} = config;
    const {defaultIsOpen, canToggle, onChatLoaded = noop} = this.props;

    if (onChatLoaded && typeof onChatLoaded === 'function') {
      onChatLoaded();
    }

    if (defaultIsOpen || !canToggle) {
      this.setState({isOpen: true}, () => this.emitToggleEvent(true));
    }

    this.send('papercups:plan', {plan: subscriptionPlan});
  };

  formatCustomerMetadata = () => {
    const {customer = {}} = this.props;

    if (!customer) {
      return {};
    }

    return Object.keys(customer).reduce((acc, key) => {
      if (key === 'metadata') {
        return {...acc, [key]: customer[key]};
      } else {
        // Make sure all other passed-in values are strings
        return {...acc, [key]: String(customer[key])};
      }
    }, {});
  };

  sendCustomerUpdate = (payload: any) => {
    const {customerId} = payload;
    const customerBrowserInfo = getUserInfo(window);
    const metadata = {...customerBrowserInfo, ...this.formatCustomerMetadata()};

    return this.send('customer:update', {customerId, metadata});
  };

  handleCacheCustomerId = (payload: any) => {
    const {customerId} = payload;

    // Let other modules know that the customer has been set
    this.logger.debug('Caching customer ID:', customerId);
    window.dispatchEvent(
      new CustomEvent('papercups:customer:set', {
        detail: customerId,
      })
    );

    this.storage.setCustomerId(customerId);
  };

  emitToggleEvent = (isOpen: boolean) => {
    this.send('papercups:toggle', {isOpen});

    const {onChatOpened = noop, onChatClosed = noop} = this.props;

    if (isOpen) {
      onChatOpened && onChatOpened();
    } else {
      onChatClosed && onChatClosed();
    }
  };

  handleOpenWidget = () => {
    if (!this.props.canToggle || this.state.isOpen) {
      return;
    }

    this.setState({isOpen: true}, () => this.emitToggleEvent(true));
  };

  handleCloseWidget = () => {
    if (!this.props.canToggle || !this.state.isOpen) {
      return;
    }

    this.setState({isOpen: false}, () => this.emitToggleEvent(false));
  };

  handleToggleOpen = () => {
    const {isOpen: wasOpen, isLoaded, shouldDisplayNotifications} = this.state;
    const isOpen = !wasOpen;

    // Prevent opening the widget until everything has loaded
    if (!isLoaded || !this.props.canToggle) {
      return;
    }

    if (!wasOpen && shouldDisplayNotifications) {
      this.setState({isTransitioning: true}, () => {
        setTimeout(() => {
          this.setState({isOpen, isTransitioning: false}, () =>
            this.emitToggleEvent(isOpen)
          );
        }, 200);
      });
    } else {
      this.setState({isOpen}, () => this.emitToggleEvent(isOpen));
    }
  };

  render() {
    const {
      isOpen,
      isLoaded,
      query,
      config,
      shouldDisplayNotifications,
      isTransitioning,
    } = this.state;
    const {customIconUrl, children} = this.props;
    const {primaryColor} = config;

    if (!query) {
      return null;
    }

    const iframeUrl = this.getIframeUrl();
    const isActive = (isOpen || shouldDisplayNotifications) && !isTransitioning;
    const theme = getThemeConfig({primary: primaryColor});
    const sandbox = [
      // Allow scripts to load in iframe
      'allow-scripts',
      // Allow opening links from iframe
      'allow-popups',
      // Needed to access localStorage
      'allow-same-origin',
      // Allow form for message input
      'allow-forms',
    ].join(' ');

    return (
      <ThemeProvider theme={theme}>
        {children({
          sandbox,
          isLoaded,
          isActive,
          isOpen,
          isTransitioning,
          customIconUrl,
          iframeUrl,
          query,
          shouldDisplayNotifications,
          setIframeRef: this.setIframeRef,
          onToggleOpen: this.handleToggleOpen,
        })}
      </ThemeProvider>
    );
  }
}

export default ChatWidgetContainer;
