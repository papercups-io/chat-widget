import ChatWidget from './components/ChatWidget';
import ChatWindow from './components/ChatWindow';

export const open = () => window.dispatchEvent(new Event('papercups:open'));
export const close = () => window.dispatchEvent(new Event('papercups:close'));
export const toggle = () => window.dispatchEvent(new Event('papercups:toggle'));

export const Papercups = {
  open,
  close,
  toggle,
};

export {ChatWidget, ChatWindow};

export default ChatWidget;
