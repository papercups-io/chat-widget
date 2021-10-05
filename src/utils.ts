export type WidgetConfig = {
  token?: string;
  inbox?: string;
  // TODO: deprecate
  accountId?: string;
  baseUrl?: string;
  title?: string;
  subtitle?: string;
  primaryColor?: string;
  greeting?: string;
  awayMessage?: string;
  newMessagePlaceholder?: string;
  emailInputPlaceholder?: string;
  newMessagesNotificationText?: string;
  companyName?: string;
  agentAvailableText?: string;
  agentUnavailableText?: string;
  showAgentAvailability?: 1 | 0;
  requireEmailUpfront?: 1 | 0;
  disableAnalyticsTracking?: 1 | 0;
  closeable?: 1 | 0;
  debug?: 1 | 0;
  customerId?: string;
  subscriptionPlan?: string;
  isBrandingHidden?: boolean;
  isOutsideWorkingHours?: boolean;
  metadata?: string; // stringified JSON
  version?: string;
  ts?: string;
};

export function noop() {}
