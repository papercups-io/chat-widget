export type User = {
  id: number;
  email: string;
  display_name?: string;
  full_name?: string;
  profile_photo_url?: string;
};

export type Message = {
  id?: string;
  body: string;
  sent_at?: string;
  seen_at?: string;
  created_at?: string;
  customer_id?: string;
  user_id?: number;
  user?: User;
  type?: 'bot' | 'agent' | 'customer';
};

export type CustomerMetadata = {
  name?: string;
  email?: string;
  external_id?: string;
  metadata?: {[key: string]: any};
  // TODO: include browser info
};

export type Account = {
  company_name?: string;
  subscription_plan?: string;
  working_hours?: WorkingHours;
};

export type WidgetSettings = {
  // settings from the API
  subtitle?: string;
  title?: string;
  base_url?: string;
  color?: string;
  greeting?: string;
  new_message_placeholder?: string;
  hide_outside_working_hours?: boolean;
  account?: Account;
};

export type WidgetConfig = {
  // fully configured widget
  accountId?: string;
  baseUrl?: string;
  title?: string;
  subtitle?: string;
  primaryColor?: string;
  greeting?: string;
  newMessagePlaceholder?: string;
  agentAvailableText?: string;
  agentUnavailableText?: string;
  showAgentAvailability?: 1 | 0;
  requireEmailUpfront?: 1 | 0;
  closeable?: 1 | 0;
  customerId?: string;
  companyName?: string;
  subscriptionPlan?: string;
  hideOutsideWorkingHours?: boolean;
  workingHours?: WorkingHours | null;
  metadata?: string; // stringified JSON
  version?: string;
};


export type WorkingHours = {
  day: string;
  start_minute: number;
  end_minute: number;
};
