import React from 'react';
import {Flex} from 'theme-ui';
import {motion} from 'framer-motion';
import {colors} from './common';
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

export const WidgetToggle = ({toggle}: {toggle: () => void}) => (
  <Flex
    sx={{
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
    }}
  >
    <button
      className={styles.WidgetToggle}
      style={{background: colors.primary}}
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
    </button>
  </Flex>
);

export default WidgetToggle;
