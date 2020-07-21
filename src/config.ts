
export const getBackendUrl = () => {
  const isProd = window.location.hostname !== 'localhost';

  const API_BASE_URL = isProd
    ? 'https://app.papercups.io'
    : 'http://localhost:4000';

  const WS_URL = isProd
    ? 'wss://app.papercups.io/socket'
    : 'ws://localhost:4000/socket';
  
    return {API_BASE_URL, WS_URL}
};