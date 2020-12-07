// https://github.com/system-ui/theme-ui/issues/1160
/** @jsxRuntime classic */
/** @jsx jsx */

import React from 'react';
import {motion} from 'framer-motion';
import {jsx} from 'theme-ui';
import WidgetToggle from './WidgetToggle';
import ChatWidgetContainer, {SharedProps} from './ChatWidgetContainer';
import ErrorBoundary from './ErrorBoundary';

type Props = SharedProps & {
  defaultIsOpen?: boolean;
  hideToggleButton?: boolean;
  iconVariant?: 'outlined' | 'filled';
};

const ChatWidget = (props: Props) => {
  return (
    <ErrorBoundary>
      <ChatWidgetContainer {...props} canToggle>
        {(config) => {
          const {
            sandbox,
            isLoaded,
            isActive,
            isOpen,
            isTransitioning,
            customIconUrl,
            iframeUrl,
            query,
            shouldDisplayNotifications,
            setIframeRef,
            onToggleOpen,
          } = config;
          const {hideToggleButton, iconVariant} = props;

          return (
            <React.Fragment>
              <span data-testid="widget-iframewrapper" style={{width: 0}}></span>
              <motion.iframe
                ref={setIframeRef}
                title='Papercups Chat Widget Container'
                className='Papercups-chatWindowContainer'
                sandbox={sandbox}
                animate={isActive ? 'open' : 'closed'}
                initial='closed'
                variants={{
                  closed: {opacity: 0, y: 4},
                  open: {opacity: 1, y: 0},
                }}
                transition={{duration: 0.2, ease: 'easeIn'}}
                src={`${iframeUrl}?${query}`}
                style={
                  isActive
                    ? {}
                    : {pointerEvents: 'none', height: 0, minHeight: 0}
                }
                sx={{
                  border: 'none',
                  bg: 'background',
                  variant:
                    !isOpen && shouldDisplayNotifications
                      ? 'styles.WidgetContainer.notifications'
                      : 'styles.WidgetContainer',
                }}
              >
                Loading...
              </motion.iframe>

              {isLoaded && !hideToggleButton && (
                <motion.div
                  className='Papercups-toggleButtonContainer'
                  initial={false}
                  animate={isOpen ? 'open' : 'closed'}
                  sx={{
                    variant: 'styles.WidgetToggleContainer',
                  }}
                >
                  <WidgetToggle
                    isDisabled={isTransitioning}
                    isOpen={isOpen}
                    customIconUrl={customIconUrl}
                    iconVariant={iconVariant}
                    toggle={onToggleOpen}
                  />
                </motion.div>
              )}
            </React.Fragment>
          );
        }}
      </ChatWidgetContainer>
    </ErrorBoundary>
  );
};

export default ChatWidget;
