import request from 'superagent';

// TODO: handle this on the server instead
function now() {
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

export const createNewCustomer = async (accountId: string, API_BASE_URL: string) => {
  return request
    .post(`${API_BASE_URL}/api/customers`)
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
  API_BASE_URL: string
) => {
  return request
    .post(`${API_BASE_URL}/api/conversations`)
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
  API_BASE_URL: string
) => {
  return request
    .get(`${API_BASE_URL}/api/conversations/customer`)
    .query({customer_id: customerId, account_id: accountId})
    .then((res) => res.body.data);
};
