import React from 'react';
import {Button, Flex} from 'theme-ui';
import {motion} from 'framer-motion';

// const svgV1 = () => {
//   return (
//     <svg
//       width='27'
//       height='27'
//       viewBox='0 0 27 27'
//       fill='none'
//       xmlns='http://www.w3.org/2000/svg'
//     >
//       <path
//         d='M7.5 14.5 L 19 14.5'
//         stroke='black'
//         stroke-width='3'
//         stroke-linecap='round'
//       />
//       <path
//         d='M7.5 8.5 L 19 8.5'
//         stroke='black'
//         stroke-width='3'
//         stroke-linecap='round'
//       />
//       <path
//         d='M22.3594 21.7143C22.3594 21.162 22.8167 20.7327 23.3475 20.5803C24.8577 20.1468 25.7344 18.7097 25.7344 16.9857V9.11429C25.7344 4.76429 21.9375 1.24286 17.7188 1.24286H9.28125C4.85156 1.24286 1.26562 4.76429 1.26562 9.11429V13.6714C1.26562 18.2286 4.85156 21.5429 9.28125 21.5429H13.2677C13.4205 21.5429 13.5713 21.5779 13.7085 21.6452L20.25 24.8571L20.8517 25.2117C21.5184 25.6045 22.3594 25.1239 22.3594 24.3501V24.0286V22.7857V21.7143Z'
//         stroke='black'
//         stroke-width='3'
//       />
//     </svg>
//   );
// };

// const x = () => {
//   return (
//     <svg
//       width='27'
//       height='27'
//       viewBox='0 0 27 27'
//       fill='none'
//       xmlns='http://www.w3.org/2000/svg'
//     >
//       <path
//         d='M5 5 L 22 22'
//         stroke='black'
//         stroke-width='3'
//         stroke-linecap='round'
//       />
//       <path
//         d='M5 22 L 22 5'
//         stroke='black'
//         stroke-width='3'
//         stroke-linecap='round'
//       />
//     </svg>
//   );
// };

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
  // open,
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
        sx={{
          bg: 'primary',
          // pt: '2px',
          // pl: open ? '2px' : 0,
          variant: 'styles.WidgetToggle',
        }}
        onClick={toggle}
      >
        <svg width='27' height='27' viewBox='0 0 27 27'>
          {/* <Path
            variants={{
              closed: {d: 'M 7.5 14.5 L 19 14.5'},
              open: {d: 'M 7 7 L 20 20'}, // X
            }}
          /> */}
          <Path
            // d='M 7 7 L 20 20'
            variants={{
              closed: {opacity: 0, d: 'M 7.5 14.5 L 19 14.5'},
              open: {opacity: 1, d: 'M 7 7 L 20 20'},
            }}
            transition={{duration: 0.2}}
          />
          {/* <Path
            d='M 2 9.423 L 20 9.423'
            variants={{
              closed: {opacity: 1},
              open: {opacity: 0},
            }}
            transition={{duration: 0.1}}
          /> */}
          {/* <Path
            variants={{
              closed: {d: 'M 7.5 8.5 L 19 8.5'},
              open: {d: 'M 7 20 L 20 7'}, // X
            }}
          /> */}
          <Path
            // d='M 7 20 L 20 7'
            variants={{
              closed: {opacity: 0, d: 'M 7.5 8.5 L 19 8.5'},
              open: {opacity: 1, d: 'M 7 20 L 20 7'},
            }}
            transition={{duration: 0.2}}
          />
          <Path
            d='M22.3594 21.7143C22.3594 21.162 22.8167 20.7327 23.3475 20.5803C24.8577 20.1468 25.7344 18.7097 25.7344 16.9857V9.11429C25.7344 4.76429 21.9375 1.24286 17.7188 1.24286H9.28125C4.85156 1.24286 1.26562 4.76429 1.26562 9.11429V13.6714C1.26562 18.2286 4.85156 21.5429 9.28125 21.5429H13.2677C13.4205 21.5429 13.5713 21.5779 13.7085 21.6452L20.25 24.8571L20.8517 25.2117C21.5184 25.6045 22.3594 25.1239 22.3594 24.3501V24.0286V22.7857V21.7143Z'
            variants={{
              closed: {opacity: 1},
              open: {opacity: 0},
            }}
            transition={{duration: 0.2}}
          />
        </svg>
      </Button>
    </Flex>
  );
};

export default WidgetToggle;
