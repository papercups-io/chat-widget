import React from 'react';
import {Button, Flex, Image} from 'theme-ui';
import {motion} from 'framer-motion';

const Path = (props: any) => (
  <motion.path
    fill='transparent'
    strokeWidth='3'
    stroke='hsl(0, 0%, 99%)'
    strokeLinecap='round'
    {...props}
  />
);

const DefaultToggleIcon = () => {
  return (
    <svg width='27' height='27' viewBox='0 0 27 27'>
      <Path
        variants={{
          closed: {opacity: 0, d: 'M 7.5 14.5 L 19 14.5'},
          open: {opacity: 1, d: 'M 7 7 L 20 20'},
        }}
        transition={{duration: 0.2}}
      />

      <Path
        variants={{
          closed: {opacity: 0, d: 'M 7.5 8.5 L 19 8.5'},
          open: {opacity: 1, d: 'M 7 20 L 20 7'},
        }}
        transition={{duration: 0.2}}
      />

      <Path
        d='M22 21.6453C22 20 23 19.5 23 19.5C23 19.5 25.5 18 25.5 14V9C25.5 4 23 1.5 18 1.5H9C4 1.5 1.5 4 1.5 9V14C1.5 19 4 21 9 21H13.5C14 21 14 21 15 21.5L20.25 24.8572L20.8517 25.2118C21.5184 25.6046 22 25.631 22 24.8572V24.0287V22.7858V21.6453Z'
        variants={{
          closed: {opacity: 1},
          open: {opacity: 0},
        }}
        transition={{duration: 0.2}}
      />
    </svg>
  );
};

const DefaultCloseIcon = () => {
  return (
    <svg width='27' height='27' viewBox='0 0 27 27'>
      <Path
        variants={{
          closed: {opacity: 0, d: 'M 7.5 14.5 L 19 14.5'},
          open: {opacity: 1, d: 'M 7 7 L 20 20'},
        }}
        transition={{duration: 0.2}}
      />

      <Path
        variants={{
          closed: {opacity: 0, d: 'M 7.5 8.5 L 19 8.5'},
          open: {opacity: 1, d: 'M 7 20 L 20 7'},
        }}
        transition={{duration: 0.2}}
      />
    </svg>
  );
};

const ToggleIcon = ({
  isOpen,
  customIconUrl,
}: {
  isOpen?: boolean;
  customIconUrl?: string;
}) => {
  if (!customIconUrl) {
    return <DefaultToggleIcon />;
  }

  if (isOpen) {
    return <DefaultCloseIcon />;
  } else {
    return <Image src={customIconUrl} style={{maxHeight: 40, maxWidth: 40}} />;
  }
};

export const WidgetToggle = ({
  isOpen,
  isDisabled,
  customIconUrl,
  toggle,
}: {
  isOpen?: boolean;
  isDisabled?: boolean;
  customIconUrl?: string;
  toggle: () => void;
}) => {
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
        className='Papercups-toggleButton'
        variant='primary'
        p={0}
        sx={{
          variant: 'styles.WidgetToggle',
        }}
        disabled={isDisabled}
        onClick={toggle}
      >
        <ToggleIcon customIconUrl={customIconUrl} isOpen={isOpen} />
      </Button>
    </Flex>
  );
};

export default WidgetToggle;
