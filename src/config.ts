export const DEFAULT_BASE_URL = 'https://app.papercups.io';

export const isDev = (w: any) => {
  return Boolean(
    w.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      w.location.hostname === '[::1]' ||
      // 127.0.0.0/8 are considered localhost for IPv4.
      w.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
  );
};

export const getWebsocketUrl = (baseUrl = DEFAULT_BASE_URL) => {
  // TODO: handle this parsing better
  const [protocol, host] = baseUrl.split('://');
  const isHttps = protocol === 'https';

  // TODO: not sure how websockets work with subdomains
  return `${isHttps ? 'wss' : 'ws'}://${host}/socket`;
};
