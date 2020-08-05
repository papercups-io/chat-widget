/** @jsx jsx */

import React from 'react';
import {motion} from 'framer-motion';
import {ThemeProvider, jsx} from 'theme-ui';
import ChatWindow from './ChatWindow';
import WidgetToggle from './WidgetToggle';
import {CustomerMetadata} from '../api';
import getThemeConfig from '../theme';

type Props = {
  title?: string;
  subtitle?: string;
  primaryColor?: string;
  accountId: string;
  baseUrl?: string;
  greeting?: string;
  customer?: CustomerMetadata;
  defaultIsOpen?: boolean;
};

const EmbeddableWidget = ({
  accountId,
  title,
  subtitle,
  primaryColor,
  baseUrl,
  greeting,
  customer,
  defaultIsOpen = false,
}: Props) => {
  const [isOpen, setIsOpen] = React.useState(defaultIsOpen);
  const theme = getThemeConfig({primary: primaryColor});

  const handleToggleOpen = () => setIsOpen(!isOpen);

  return (
    <ThemeProvider theme={theme}>
      {/* TODO: use emotion or styled to handle this? */}
      {isOpen && (
        <motion.div
          className='Papercups-chatWindowContainer'
          initial={{opacity: 0, y: 4}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.2, ease: 'easeIn'}}
          sx={{
            variant: 'styles.WidgetContainer',
          }}
        >
          <ChatWindow
            title={title}
            subtitle={subtitle}
            accountId={accountId}
            greeting={greeting}
            customer={customer}
            baseUrl={baseUrl}
          />
        </motion.div>
      )}
      <motion.div
        className='Papercups-toggleButtonContainer'
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        sx={{
          variant: 'styles.WidgetToggleContainer',
        }}
      >
        <WidgetToggle toggle={handleToggleOpen} />
      </motion.div>
    </ThemeProvider>
  );
};

export default EmbeddableWidget;
