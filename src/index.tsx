import ChatWidget from './components/ChatWidget';
import ChatWindow from './components/ChatWindow';
import * as Types from './types';

export const open = () => window.dispatchEvent(new Event('papercups:open'));
export const close = () => window.dispatchEvent(new Event('papercups:close'));
export const toggle = () => window.dispatchEvent(new Event('papercups:toggle'));

export const identify = () => {
  // TODO: add ability to create/update customer information
  console.warn('`Papercups.identify` has not been implemented yet!');
};

export const Papercups = {
  open,
  close,
  toggle,
};

export {Types};

export {ChatWidget, ChatWindow};

export default ChatWidget;
