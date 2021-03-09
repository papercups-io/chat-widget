import request from 'superagent';
import {DEFAULT_BASE_URL} from './config';

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
  is_outside_working_hours?: boolean;
};

export type WidgetSettings = {
  id?: string;
  subtitle?: string;
  title?: string;
  base_url?: string;
  color?: string;
  greeting?: string;
  away_message?: string;
  new_message_placeholder?: string;
  email_input_placeholder?: string;
  new_messages_notification_text?: string;
  is_branding_hidden?: boolean;
  show_agent_availability?: boolean;
  agent_available_text?: string;
  agent_unavailable_text?: string;
  require_email_upfront?: boolean;
  is_open_by_default?: boolean;
  custom_icon_url?: string;
  iframe_url_override?: string;
  icon_variant?: 'outlined' | 'filled';
  account?: Account;
};

export const fetchWidgetSettings = async (
  accountId: string,
  baseUrl = DEFAULT_BASE_URL
): Promise<WidgetSettings> => {
  return request
    .get(`${baseUrl}/api/widget_settings`)
    .query({account_id: accountId})
    .then((res) => res.body.data);
};

export const updateWidgetSettingsMetadata = async (
  accountId: string,
  metadata: any,
  baseUrl = DEFAULT_BASE_URL
): Promise<WidgetSettings> => {
  return request
    .put(`${baseUrl}/api/widget_settings/metadata`)
    .send({account_id: accountId, metadata})
    .then((res) => res.body.data);
};
