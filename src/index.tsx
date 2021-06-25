import ChatWidget from './components/ChatWidget';
import ChatWindow from './components/ChatWindow';

export const open = () => window.dispatchEvent(new Event('papercups:open'));
export const close = () => window.dispatchEvent(new Event('papercups:close'));
export const toggle = () => window.dispatchEvent(new Event('papercups:toggle'));

export const identify = () => {
  // TODO: add ability to create/update customer information
  console.warn('`Papercups.identify` has not been implemented yet!');
};

export const sendBotMessage = ({
  message,
  signature,
}: {
  message: string;
  signature: string;
}) =>
  window.dispatchEvent(
    new CustomEvent('papercups:send_bot_message', {
      detail: {message, signature},
    })
  );

export const Papercups = {
  open,
  close,
  toggle,
  sendBotMessage,
};

export {ChatWidget, ChatWindow};

export default ChatWidget;
