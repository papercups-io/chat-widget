import request from 'superagent';
import {DEFAULT_BASE_URL} from './config';
import {now} from './utils';

export type CustomerMetadata = {
  name?: string;
  email?: string;
  external_id?: string;
  // TODO: include browser info
};

export type WidgetSettings = {
  subtitle?: string;
  title?: string;
  base_url?: string;
  color?: string;
  greeting?: string;
  new_message_placeholder?: string;
};

const EMPTY_METADATA = {} as CustomerMetadata;

export const createNewCustomer = async (
  accountId: string,
  metadata: CustomerMetadata = EMPTY_METADATA,
  baseUrl = DEFAULT_BASE_URL
) => {
  return request
    .post(`${baseUrl}/api/customers`)
    .send({
      customer: {
        ...metadata,
        account_id: accountId,
        first_seen: now(),
        last_seen: now(),
      },
    })
    .then((res) => res.body.data);
};

export const updateCustomerMetadata = async (
  customerId: string,
  metadata: CustomerMetadata = EMPTY_METADATA,
  baseUrl = DEFAULT_BASE_URL
) => {
  return request
    .put(`${baseUrl}/api/customers/${customerId}/metadata`)
    .send({
      metadata,
    })
    .then((res) => res.body.data);
};

export const createNewConversation = async (
  accountId: string,
  customerId: string,
  baseUrl = DEFAULT_BASE_URL
) => {
  return request
    .post(`${baseUrl}/api/conversations`)
    .send({
      conversation: {
        account_id: accountId,
        customer_id: customerId,
      },
    })
    .then((res) => res.body.data);
};

export const fetchCustomerConversations = async (
  customerId: string,
  accountId: string,
  baseUrl = DEFAULT_BASE_URL
) => {
  return request
    .get(`${baseUrl}/api/conversations/customer`)
    .query({customer_id: customerId, account_id: accountId})
    .then((res) => res.body.data);
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
