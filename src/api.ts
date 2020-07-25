import request from 'superagent';
import {DEFAULT_BASE_URL} from './config';
import {now} from './utils';

export const createNewCustomer = async (
  accountId: string,
  baseUrl = DEFAULT_BASE_URL
) => {
  return request
    .post(`${baseUrl}/api/customers`)
    .send({
      customer: {
        account_id: accountId,
        first_seen: now(),
        last_seen: now(),
      },
    }) // TODO: send over some metadata?
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
