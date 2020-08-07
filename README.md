# @papercups-io/chat-widget

> Papercups chat widget

[![NPM](https://img.shields.io/npm/v/@papercups-io/chat-widget.svg)](https://www.npmjs.com/package/@papercups-io/chat-widget) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Demo

Available at https://app.papercups.io/demo

![demo](https://user-images.githubusercontent.com/5264279/88118921-e4a37900-cb8c-11ea-825f-86deb8edc518.gif)

## Install

```bash
npm install --save @papercups-io/chat-widget
```

## Usage

First, sign up at https://app.papercups.io/register to get your account token. Your account token is what you will use to pass in as the `accountId` prop below.

### Using in HTML

Paste the code below between your `<head>` and `</head>` tags:

```html
<script>
  window.Papercups = {
    config: {
      accountId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx',
      title: 'Welcome to Papercups!',
      subtitle: 'Ask us anything in the chat window below 😊',
      newMessagePlaceholder: 'Start typing...',
      primaryColor: '#13c2c2',
      // Optionally pass in a default greeting
      greeting: 'Hi there! How can I help you?',
      // Optionally pass in metadata to identify the customer
      customer: {
        name: 'Test User',
        email: 'test@test.com',
        external_id: '123',
      },
      // Optionally specify the base URL
      baseUrl: 'https://app.papercups.io',
    },
  };
</script>
<script
  type="text/javascript"
  async
  defer
  src="https://app.papercups.io/widget.js"
></script>
```

### Using in React

Place the code below in any pages on which you would like to render the widget. If you'd like to render it in all pages by default, place it in the root component of your app.

```tsx
import React from 'react';

import ChatWidget from '@papercups-io/chat-widget';

const ExamplePage = () => {
  return (
    <>
      {/*
        Put <ChatWidget /> at the bottom of whatever pages you would
        like to render the widget on, or in your root/router component
        if you would like it to render on every page
      */}
      <ChatWidget
        accountId='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx'
        title='Welcome to Papercups!'
        subtitle='Ask us anything in the chat window below 😊'
        newMessagePlaceholder='Start typing...'
        primaryColor='#13c2c2'
        // Optionally pass in a default greeting
        greeting='Hi there! How can I help you?'
        // Optionally pass in metadata to identify the customer
        customer={{
          name: 'Test User',
          email: 'test@test.com',
          external_id: '123',
        }}
        // Optionally specify the base URL
        baseUrl='https://app.papercups.io'
      />
    </>
  );
};
```

## Development

To build the project, run `npm start` in the root directory. (If you're running it for the first time, you'll have to run `npm install` first.)

To test it out, use the `/example` directory:

```
cd example
npm install
npm start
```

This will start a development server on localhost:3000 by default, and open up the example app in your browser.

When creating a pull request, be sure to include a screenshot! 🎨

## License

MIT © Papercups
