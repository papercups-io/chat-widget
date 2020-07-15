# @papercups-io/chat-widget

> Papercups chat widget

[![NPM](https://img.shields.io/npm/v/@papercups-io/chat-widget.svg)](https://www.npmjs.com/package/@papercups-io/chat-widget) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @papercups-io/chat-widget
```

## Usage

First, sign up at https://www.papercups.io/register to get your account token.

This is what you will use to pass in as the `accountId` prop below:

```tsx
import React from 'react';

import ChatWidget from '@papercups-io/chat-widget';
import '@papercups-io/chat-widget/dist/index.css';

const ExamplePage = () => {
  return (
    <>
      {/*
        Put <ChatWidget /> at the bottom of whatever pages you would
        like to render the widget on, or in your root/router component
        if you would like it to render on every page
      */}
      <ChatWidget accountId='eb504736-0f20-4978-98ff-1a82ae60b266' />;
    </>
  );
};
```

## License

MIT © [reichert621](https://github.com/reichert621)
