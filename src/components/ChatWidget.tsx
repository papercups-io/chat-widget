/** @jsx jsx */

import React, {CSSProperties} from 'react';
import {motion} from 'framer-motion';
import {jsx} from 'theme-ui';

import WidgetToggle from './WidgetToggle';
import ChatWidgetContainer, {SharedProps} from './ChatWidgetContainer';
import ErrorBoundary from './ErrorBoundary';

type ToggleButtonOptions = {
  isOpen: boolean;
  isDisabled: boolean;
  onToggleOpen: () => void;
};

type StyleOverrides = {
  chatContainer?: CSSProperties;
  toggleContainer?: CSSProperties;
  toggleButton?: CSSProperties;
};

type PositionConfig = {
  side: 'left' | 'right';
  offset: number;
};

const DEFAULT_X_OFFSET = 20;

const normalizePositionConfig = (
  position?: 'left' | 'right' | PositionConfig
): PositionConfig => {
  if (!position) {
    return {side: 'right', offset: DEFAULT_X_OFFSET};
  }

  switch (position) {
    case 'left':
      return {side: 'left', offset: DEFAULT_X_OFFSET};
    case 'right':
      return {side: 'right', offset: DEFAULT_X_OFFSET};
    default:
      return position;
  }
};

const getDefaultStyles = (
  styles: StyleOverrides = {},
  position: PositionConfig
): StyleOverrides => {
  const {
    chatContainer: chatContainerStyle = {},
    toggleContainer: toggleContainerStyle = {},
    toggleButton: toggleButtonStyle = {},
  } = styles;
  const {side = 'right', offset = DEFAULT_X_OFFSET} = position;

  switch (side) {
    case 'left':
      return {
        chatContainer: {left: offset, right: 'auto', ...chatContainerStyle},
        toggleContainer: {left: offset, right: 'auto', ...toggleContainerStyle},
        toggleButton: toggleButtonStyle,
      };
    case 'right':
    default:
      return {
        chatContainer: {right: offset, left: 'auto', ...chatContainerStyle},
        toggleContainer: {right: offset, left: 'auto', ...toggleContainerStyle},
        toggleButton: toggleButtonStyle,
      };
  }
};

type Props = SharedProps & {
  defaultIsOpen?: boolean;
  isOpenByDefault?: boolean;
  persistOpenState?: boolean;
  hideToggleButton?: boolean;
  iconVariant?: 'outlined' | 'filled';
  position?: 'left' | 'right' | PositionConfig;
  renderToggleButton?: (options: ToggleButtonOptions) => React.ReactElement;
  styles?: StyleOverrides;
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

          const {
            hideToggleButton,
            iconVariant,
            renderToggleButton,
            position = 'right',
            styles = {},
          } = props;
          const positionConfig = normalizePositionConfig(position);
          const {
            chatContainer: chatContainerStyle = {},
            toggleContainer: toggleContainerStyle = {},
            toggleButton: toggleButtonStyle = {},
          } = getDefaultStyles(styles, positionConfig);

          return (
            <React.Fragment>
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
                    ? chatContainerStyle
                    : {
                        pointerEvents: 'none',
                        height: 0,
                        minHeight: 0,
                      }
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
                  style={toggleContainerStyle}
                  animate={isOpen ? 'open' : 'closed'}
                  sx={{
                    variant: 'styles.WidgetToggleContainer',
                  }}
                >
                  {renderToggleButton &&
                  typeof renderToggleButton === 'function' ? (
                    renderToggleButton({
                      isOpen,
                      onToggleOpen,
                      isDisabled: isTransitioning,
                    })
                  ) : (
                    <WidgetToggle
                      style={toggleButtonStyle}
                      isDisabled={isTransitioning}
                      isOpen={isOpen}
                      customIconUrl={customIconUrl}
                      iconVariant={iconVariant}
                      toggle={onToggleOpen}
                    />
                  )}
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
