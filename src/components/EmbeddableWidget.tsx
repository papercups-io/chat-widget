import React from 'react';
import {motion} from 'framer-motion';
import {ThemeProvider} from 'theme-ui';
import ChatWidget from './ChatWidget';
import WidgetToggle from './WidgetToggle';
import getThemeConfig from '../theme';
import styles from '../styles.module.css';

type Props = {
  title?: string;
  subtitle?: string;
  primaryColor?: string;
  accountId: string;
};
type State = {
  theme: any;
  open: boolean;
};

class EmbeddableWidget extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      theme: getThemeConfig({primary: props.primaryColor}),
      open: false,
    };
  }

  handleToggleOpen = () => {
    this.setState({open: !this.state.open});
  };

  render() {
    const {theme, open} = this.state;

    return (
      <ThemeProvider theme={theme}>
        {/* TODO: use emotion or styled to handle this? */}
        {open && (
          <motion.div
            className={styles.ChatWidget}
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
            <ChatWidget
              title={this.props.title}
              subtitle={this.props.subtitle}
              accountId={this.props.accountId}
            />
          </motion.div>
        )}
        <motion.div
          initial={false}
          animate={open ? 'open' : 'closed'}
          style={{
            position: 'fixed',
            zIndex: 2147483003,
            bottom: '20px',
            right: '20px',
          }}
        >
          <WidgetToggle open={open} toggle={this.handleToggleOpen} />
        </motion.div>
      </ThemeProvider>
    );
  }
}

export default EmbeddableWidget;
