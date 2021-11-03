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
  isValidUuid,
  getUserInfo,
  setupCustomEventHandlers,
  setupPostMessageHandlers,
} from '@papercups-io/browser';

import {WidgetConfig, noop} from '../utils';
import getThemeConfig from '../theme';
import store from '../storage';
import Logger from '../logger';

const DEFAULT_IFRAME_URL = 'https://chat-widget.papercups.io';

export type SharedProps = {
  token: string;
  inbox?: string;
  // TODO: deprecate, use `token` instead
  accountId?: string;
  title?: string;
  subtitle?: string;
  primaryColor?: string;
  baseUrl?: string;
  greeting?: string;
  awayMessage?: string;
  customer?: CustomerMetadata | null;
  newMessagePlaceholder?: string;
  emailInputPlaceholder?: string;
  newMessagesNotificationText?: string;
  agentAvailableText?: string;
  agentUnavailableText?: string;
  showAgentAvailability?: boolean;
  iframeUrlOverride?: string;
  requireEmailUpfront?: boolean;
  hideOutsideWorkingHours?: boolean;
  popUpInitialMessage?: boolean | number;
  customIconUrl?: string;
  disableAnalyticsTracking?: boolean;
  debug?: boolean;
  onChatLoaded?: ({
    open,
    close,
    identify,
  }: {
    open: () => void;
    close: () => void;
    identify: (data: any) => void;
  }) => void;
  onChatOpened?: () => void;
  onChatClosed?: () => void;
  onMessageSent?: (message: Message) => void;
  onMessageReceived?: (message: Message) => void;
  // TODO: how should we name these?
  setDefaultTitle?: (settings: WidgetSettings) => string | Promise<string>;
  setDefaultSubtitle?: (settings: WidgetSettings) => string | Promise<string>;
  setDefaultGreeting?: (settings: WidgetSettings) => string | Promise<string>;
};

type Props = SharedProps & {
  defaultIsOpen?: boolean;
  isOpenByDefault?: boolean;
  persistOpenState?: boolean;
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
  logger: Logger = new Logger();

  EVENTS = [
    'papercups:open',
    'papercups:close',
    'papercups:toggle',
    'papercups:identify',
    'papercups:customer:set',
    'storytime:customer:set',
  ];

  constructor(props: Props) {
    super(props);

    const token = props.token || props.accountId;

    if (!token) {
      throw new Error('A `token` is required to run the Papercups chat!');
    } else if (!isValidUuid(token)) {
      console.error(
        `The \`token\` must be a valid UUID. (Received invalid \`token\`: ${token})`
      );
      console.error(
        `If you're missing a Papercups \`token\`, you can get one by signing up for a free account at https://app.papercups.io/register`
      );
      throw new Error(`Invalid \`token\`: ${token}`);
    }

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
    const ts = +new Date();
    const {
      token,
      inbox,
      accountId,
      primaryColor,
      baseUrl,
      awayMessage,
      newMessagePlaceholder,
      emailInputPlaceholder,
      newMessagesNotificationText,
      agentAvailableText,
      agentUnavailableText,
      showAgentAvailability,
      requireEmailUpfront,
      disableAnalyticsTracking,
      canToggle,
      customer = {},
      debug = false,
    } = this.props;

    this.logger = new Logger(!!debug);
    this.subscriptions = [
      setupPostMessageHandlers(window, this.postMessageHandlers),
      setupCustomEventHandlers(window, this.EVENTS, this.customEventHandlers),
    ];

    this.storage = store(window);
    // TODO: use `subscription_plan` from settings.account to determine
    // whether to display the Papercups branding or not in the chat window
    const settings = await this.fetchWidgetSettings();
    const metadata = {...getUserInfo(window), ...customer};
    const config: WidgetConfig = {
      baseUrl,
      inbox,
      token: token || accountId,
      // TODO: deprecate
      accountId: token || accountId,
      title: await this.getDefaultTitle(settings),
      subtitle: await this.getDefaultSubtitle(settings),
      primaryColor: primaryColor || settings.color,
      greeting: await this.getDefaultGreeting(settings),
      awayMessage: awayMessage || settings.away_message,
      newMessagePlaceholder:
        newMessagePlaceholder || settings.new_message_placeholder,
      emailInputPlaceholder:
        emailInputPlaceholder || settings.email_input_placeholder,
      newMessagesNotificationText:
        newMessagesNotificationText || settings.new_messages_notification_text,
      companyName: settings?.account?.company_name,
      requireEmailUpfront:
        requireEmailUpfront || settings.require_email_upfront ? 1 : 0,
      showAgentAvailability:
        showAgentAvailability || settings.show_agent_availability ? 1 : 0,
      agentAvailableText: settings.agent_available_text || agentAvailableText,
      agentUnavailableText:
        settings.agent_unavailable_text || agentUnavailableText,
      closeable: canToggle ? 1 : 0,
      customerId: this.storage.getCustomerId(),
      subscriptionPlan: settings?.account?.subscription_plan,
      isOutsideWorkingHours: settings?.account?.is_outside_working_hours,
      isBrandingHidden: settings?.is_branding_hidden,
      metadata: JSON.stringify(metadata),
      disableAnalyticsTracking: disableAnalyticsTracking ? 1 : 0,
      debug: debug ? 1 : 0,
      version: '1.3.1',
      ts: ts.toString(),
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
    // Don't do anything if the widget hasn't loaded yet
    if (!this.state.isLoaded) {
      return;
    }

    const {
      token,
      inbox,
      accountId,
      title,
      subtitle,
      primaryColor,
      baseUrl,
      greeting,
      newMessagePlaceholder,
      emailInputPlaceholder,
      newMessagesNotificationText,
      requireEmailUpfront,
      showAgentAvailability,
      agentAvailableText,
      agentUnavailableText,
      customer,
    } = this.props;
    const current = [
      token,
      inbox,
      accountId,
      title,
      subtitle,
      primaryColor,
      baseUrl,
      greeting,
      newMessagePlaceholder,
      emailInputPlaceholder,
      newMessagesNotificationText,
      requireEmailUpfront,
      showAgentAvailability,
      agentAvailableText,
      agentUnavailableText,
    ];
    const prev = [
      prevProps.token,
      prevProps.inbox,
      prevProps.accountId,
      prevProps.title,
      prevProps.subtitle,
      prevProps.primaryColor,
      prevProps.baseUrl,
      prevProps.greeting,
      prevProps.newMessagePlaceholder,
      prevProps.emailInputPlaceholder,
      prevProps.newMessagesNotificationText,
      prevProps.requireEmailUpfront,
      prevProps.showAgentAvailability,
      prevProps.agentAvailableText,
      prevProps.agentUnavailableText,
    ];
    const {customerId} = this.state.config;
    const shouldUpdateConfig = current.some((value, idx) => {
      return value !== prev[idx];
    });

    // Send updates to iframe if props change. (This is mainly for use in
    // the demo and "Getting Started" page, where users can play around with
    // customizing the chat widget to suit their needs)
    if (shouldUpdateConfig) {
      this.handleConfigUpdated({
        token,
        inbox,
        accountId,
        title,
        subtitle,
        primaryColor,
        baseUrl,
        greeting,
        newMessagePlaceholder,
        emailInputPlaceholder,
        newMessagesNotificationText,
        agentAvailableText,
        agentUnavailableText,
        requireEmailUpfront: requireEmailUpfront ? 1 : 0,
        showAgentAvailability: showAgentAvailability ? 1 : 0,
      });
    }

    if (this.shouldUpdateCustomer(customer, prevProps.customer)) {
      this.updateCustomerMetadata(customerId, customer);
    }
  }

  shouldUpdateCustomer = (current: any, previous: any) => {
    if (!current) {
      return false;
    } else if (current && !previous) {
      return true;
    }

    const {metadata: x = {}, ...a} = current || {};
    const {metadata: y = {}, ...b} = previous || {};

    const hasMatchingInfo = Object.keys(a).every((key) => a[key] === b[key]);
    const hasMatchingMetadata = Object.keys(x).every(
      (key) => x[key] === y[key]
    );

    return !(hasMatchingInfo && hasMatchingMetadata);
  };

  getDefaultTitle = async (settings: WidgetSettings) => {
    const {title, setDefaultTitle} = this.props;

    if (setDefaultTitle && typeof setDefaultTitle === 'function') {
      return setDefaultTitle(settings);
    } else {
      return title || settings.title;
    }
  };

  getDefaultSubtitle = async (settings: WidgetSettings) => {
    const {subtitle, setDefaultSubtitle} = this.props;

    if (setDefaultSubtitle && typeof setDefaultSubtitle === 'function') {
      return setDefaultSubtitle(settings);
    } else {
      return subtitle || settings.subtitle;
    }
  };

  getDefaultGreeting = async (settings: WidgetSettings) => {
    const {greeting, setDefaultGreeting} = this.props;

    if (setDefaultGreeting && typeof setDefaultGreeting === 'function') {
      return setDefaultGreeting(settings);
    } else {
      return greeting || settings.greeting;
    }
  };

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

  handleSetCustomerId = (id?: any) => {
    const cachedCustomerId = this.storage.getCustomerId();
    const customerId = id || cachedCustomerId;

    this.logger.debug('Setting customer ID:', customerId);
    this.setState({
      config: {...this.state.config, customerId},
    });
    this.send('customer:set:id', customerId);
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

  fetchWidgetSettings = async (): Promise<WidgetSettings> => {
    const {token, inbox, accountId, baseUrl} = this.props;
    const params = {account_id: accountId || token, inbox_id: inbox};
    const empty = {} as WidgetSettings;

    return fetchWidgetSettings(params, baseUrl)
      .then((settings) => settings || empty)
      .catch(() => empty);
  };

  updateWidgetSettingsMetadata = async () => {
    const {token, inbox, accountId, baseUrl} = this.props;
    const params = {
      account_id: accountId || token,
      inbox_id: inbox,
      metadata: getUserInfo(window),
    };

    return updateWidgetSettingsMetadata(params, baseUrl).catch((err) => {
      // No need to block on this
      this.logger.error('Failed to update widget metadata:', err);
    });
  };

  hasValidPayloadIdentity = (payload: any) => {
    const ts = payload && payload.ts;
    const {config = {} as WidgetConfig} = this.state;

    if (!ts) {
      // If the payload doesn't contain an identifier, let it pass through
      return true;
    }

    if (config.ts === ts) {
      // Pass through, since the payload identifier matches the component ts
      return true;
    }

    return false;
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
      case 'papercups:customer:set':
        return this.handleSetCustomerId(detail);
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

    if (!this.hasValidPayloadIdentity(payload)) {
      this.logger.warn(
        'Payload identifer from iframe does not match parent — halting message handlers.'
      );

      return null;
    }

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
    this.storage.setPopupSeen(true);
    this.send('notifications:display', {shouldDisplayNotifications: false});
  };

  shouldOpenByDefault = (): boolean => {
    const {
      defaultIsOpen,
      isOpenByDefault,
      persistOpenState,
      canToggle,
    } = this.props;

    if (!canToggle) {
      return true;
    }

    const isOpenFromCache = this.storage.getOpenState();

    if (persistOpenState) {
      return isOpenFromCache;
    }

    return !!(isOpenByDefault || defaultIsOpen);
  };

  handleChatLoaded = () => {
    this.setState({isLoaded: true});

    const {config = {} as WidgetConfig} = this.state;
    const {subscriptionPlan = null} = config;
    const {popUpInitialMessage, onChatLoaded = noop} = this.props;

    if (onChatLoaded && typeof onChatLoaded === 'function') {
      onChatLoaded({
        open: this.handleOpenWidget,
        close: this.handleCloseWidget,
        identify: this.identify,
      });
    }

    if (this.shouldOpenByDefault()) {
      this.setState({isOpen: true}, () => this.emitToggleEvent(true));
    }

    if (popUpInitialMessage && !this.storage.getPopupSeen()) {
      const t =
        typeof popUpInitialMessage === 'number' ? popUpInitialMessage : 0;

      setTimeout(() => {
        this.setState({shouldDisplayNotifications: true});
        this.send('notifications:display', {
          shouldDisplayNotifications: true,
          // TODO: this may not be necessary
          popUpInitialMessage: true,
        });
      }, t);
    }

    this.send('papercups:plan', {plan: subscriptionPlan});
  };

  formatCustomerMetadata = (customer: CustomerMetadata | null | undefined) => {
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

  identify = (data: CustomerMetadata) => {
    const {customerId} = this.state.config;

    return this.updateCustomerMetadata(customerId, data);
  };

  updateCustomerMetadata = (
    customerId: string | undefined,
    data: CustomerMetadata | null | undefined
  ) => {
    const customerBrowserInfo = getUserInfo(window);
    const metadata = {
      ...customerBrowserInfo,
      ...this.formatCustomerMetadata(data),
    };

    return this.send('customer:update', {customerId, metadata});
  };

  sendCustomerUpdate = (payload: any) => {
    const {customerId} = payload;
    const {customer} = this.props;

    this.updateCustomerMetadata(customerId, customer);
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
    this.setState({
      config: {...this.state.config, customerId},
    });
  };

  emitToggleEvent = (isOpen: boolean) => {
    this.send('papercups:toggle', {isOpen});

    const {
      persistOpenState = false,
      onChatOpened = noop,
      onChatClosed = noop,
    } = this.props;

    if (persistOpenState) {
      this.storage.setOpenState(isOpen);
    }

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

    if (this.state.shouldDisplayNotifications) {
      this.setState({isTransitioning: true}, () => {
        setTimeout(() => {
          this.setState({isOpen: true, isTransitioning: false}, () =>
            this.emitToggleEvent(true)
          );
        }, 200);
      });
    } else {
      this.setState({isOpen: true}, () => this.emitToggleEvent(true));
    }
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
    const {
      customIconUrl,
      hideOutsideWorkingHours = false,
      children,
    } = this.props;
    const {primaryColor} = config;

    if (!query) {
      return null;
    }

    if (hideOutsideWorkingHours && config.isOutsideWorkingHours) {
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
