import React from 'react';
import {motion} from 'framer-motion';
import ChatWidget from './ChatWidget';
import WidgetToggle from './WidgetToggle';
import styles from '../styles.module.css';

type Props = {
  title?: string;
  accountId: string;
};
type State = {
  open: boolean;
};

class EmbeddableWidget extends React.Component<Props, State> {
  state: State = {open: false};

  componentDidMount() {
    // Load widget
  }

  handleToggleOpen = () => {
    this.setState({open: !this.state.open});
  };

  render() {
    const {open} = this.state;

    return (
      <React.Fragment>
        {/* TODO: use emotion or styled to handle this? */}
        {open && (
          <motion.div
            className={styles.ChatWidget}
            initial={{opacity: 0, y: 8}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.4, ease: 'easeIn'}}
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
          <WidgetToggle toggle={this.handleToggleOpen} />
        </motion.div>
      </React.Fragment>
    );
  }
}

export default EmbeddableWidget;
