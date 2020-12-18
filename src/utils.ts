export type WidgetConfig = {
  accountId?: string;
  baseUrl?: string;
  title?: string;
  subtitle?: string;
  primaryColor?: string;
  greeting?: string;
  newMessagePlaceholder?: string;
  emailInputPlaceholder?: string;
  newMessagesNotificationText?: string;
  companyName?: string;
  agentAvailableText?: string;
  agentUnavailableText?: string;
  showAgentAvailability?: 1 | 0;
  requireEmailUpfront?: 1 | 0;
  closeable?: 1 | 0;
  customerId?: string;
  subscriptionPlan?: string;
  metadata?: string; // stringified JSON
  version?: string;
};

export function noop() {}

export function isValidUuid(id: any) {
  if (!id || typeof id !== 'string' || !id.length) {
    return false;
  }

  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return regex.test(id);
}

// TODO: handle this on the server instead
export function now() {
  const date = new Date();

  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
}
