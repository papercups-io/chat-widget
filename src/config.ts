export const DEFAULT_BASE_URL = 'https://app.papercups.io';

export const getWebsocketUrl = (baseUrl = DEFAULT_BASE_URL) => {
  // TODO: handle this parsing better
  const [protocol, host] = baseUrl.split('://');
  const isHttps = protocol === 'https';

  // TODO: not sure how websockets work with subdomains
  return `${isHttps ? 'wss' : 'ws'}://${host}/socket`;
};
