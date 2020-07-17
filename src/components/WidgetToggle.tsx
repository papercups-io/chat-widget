import React from 'react';
import {Button, Flex} from 'theme-ui';
import {motion} from 'framer-motion';
import styles from '../styles.module.css';

const Path = (props: any) => (
  <motion.path
    fill='transparent'
    strokeWidth='3'
    stroke='hsl(0, 0%, 99%)'
    strokeLinecap='round'
    {...props}
  />
);

export const WidgetToggle = ({
  open,
  toggle,
}: {
  open: boolean;
  toggle: () => void;
}) => {
  // TODO: make sure this is actually centered!
  return (
    <Flex
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <Button
        p={0}
        className={styles.WidgetToggle}
        sx={{bg: 'primary', pt: '2px', pl: open ? '2px' : 0}}
        onClick={toggle}
      >
        <svg width='23' height='23' viewBox='0 0 23 23'>
          <Path
            variants={{
              closed: {d: 'M 2 2.5 L 20 2.5'},
              open: {d: 'M 3 16.5 L 17 2.5'},
            }}
          />
          <Path
            d='M 2 9.423 L 20 9.423'
            variants={{
              closed: {opacity: 1},
              open: {opacity: 0},
            }}
            transition={{duration: 0.1}}
          />
          <Path
            variants={{
              closed: {d: 'M 2 16.346 L 20 16.346'},
              open: {d: 'M 3 2.5 L 17 16.346'},
            }}
          />
        </svg>
      </Button>
    </Flex>
  );
};

export default WidgetToggle;
