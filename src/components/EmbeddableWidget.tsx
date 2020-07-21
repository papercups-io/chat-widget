import React from 'react';
import {motion} from 'framer-motion';
import {ThemeProvider} from 'theme-ui';
import ChatWindow from './ChatWindow';
import WidgetToggle from './WidgetToggle';
import getThemeConfig from '../theme';

type Props = {
  title?: string;
  subtitle?: string;
  primaryColor?: string;
  accountId: string;
  backendUrl?: string;
};

const EmbeddableWidget = ({
  accountId,
  title,
  subtitle,
  primaryColor,
}: Props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const theme = getThemeConfig({primary: primaryColor});

  const handleToggleOpen = () => setIsOpen(!isOpen);

  return (
    <ThemeProvider theme={theme}>
      {/* TODO: use emotion or styled to handle this? */}
      {isOpen && (
        <motion.div
          sx={{margin: 0}}
          initial={{opacity: 0, y: 4}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.2, ease: 'easeIn'}}
          style={{
            zIndex: 2147483000,
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            width: '376px',
            minHeight: '250px',
            maxHeight: '704px',
            boxShadow: 'rgba(0, 0, 0, 0.16) 0px 5px 40px',
            height: 'calc(100% - 120px)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <ChatWindow title={title} subtitle={subtitle} accountId={accountId} backendUrl={backendUrl} />
        </motion.div>
      )}
      <motion.div
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        style={{
          position: 'fixed',
          zIndex: 2147483003,
          bottom: '20px',
          right: '20px',
        }}
      >
        <WidgetToggle open={isOpen} toggle={handleToggleOpen} />
      </motion.div>
    </ThemeProvider>
  );
};

export default EmbeddableWidget;
