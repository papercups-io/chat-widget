# @papercups-io/chat-widget

> Papercups chat widget

[![NPM](https://img.shields.io/npm/v/@papercups-io/chat-widget.svg)](https://www.npmjs.com/package/@papercups-io/chat-widget) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @papercups-io/chat-widget
```

## Usage

First, sign up at https://www.papercups.io/register to get your account token. Your account token is what you will use to pass in as the `accountId` prop below.

### Using in HTML

Paste the code below between your `<head>` and `</head>` tags:

```html
<script>
  window.Papercups = {
    config: {
      accountId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx',
      title: 'Welcome to Papercups!',
      subtitle: 'Ask us anything in the chat window below 😊',
      primaryColor: '#13c2c2',
    },
  };
</script>
<script
  type="text/javascript"
  async
  defer
  src="https://www.papercups.io/widget.js"
></script>
```

### Using in React

Place the code below in any pages on which you would like to render the widget. If you'd like to render it in all pages by default, place it in the root component of your app.

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
      <ChatWidget
        title='Welcome to Papercups!'
        subtitle='Ask us anything in the chat window below 😊'
        primaryColor='#13c2c2'
        accountId='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx'
      />
    </>
  );
};
```

## License

MIT © Papercups
