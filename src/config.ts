export const isProd = window.location.hostname !== 'localhost';

export const API_BASE_URL = isProd
  ? 'https://taro-chat-v1.herokuapp.com'
  : 'http://localhost:4000';

export const WS_URL = isProd
  ? 'wss://taro-chat-v1.herokuapp.com/socket'
  : 'ws://localhost:4000/socket';
