[![CircleCI](https://circleci.com/gh/meeshkan/express-middleware.svg?style=svg)](https://circleci.com/gh/meeshkan/express-middleware)
[![npm version](https://img.shields.io/npm/v/@meeshkanml/express-middleware.svg)](https://npmjs.org/package/@meeshkanml/express-middleware)

# Mem Express Middleware

Express server middleware to log requests and responses in the [HTTP Types](https://meeshkan.github.io/http-types/) format.

## Installation

Install via [npm](https://www.npmjs.com/package/@meeshkanml/express-middleware):

```bash
npm install @meeshkanml/express-middleware
```

## Usage

Add this middleware before adding routes, otherwise it won't work.

```javascript
const mw, { LocalFileSystemTransport } = require("@meeshkan/express-middleware");

// Add custom transports with signature
// `type HttpExchangeTransport = (httpExchange: HttpExchange) => Promise<void>;`
// Here `HttpExchange` is defined in `ts-http-types`
const customTransport = async httpExchange => {
  console.log("Got http exchange", httpExchange);
};

// Add middleware
app.use(
  middleware({
    transports: [
      LocalFileSystemTransport("http-exchanges.jsonl"),
      customTransport
    ],
  })
);
// add routes
```

## Development

Install dependencies:

```bash
$ yarn
```

Run tests:

```bash
$ yarn test
```

Compile TypeScript:

```bash
$ yarn compile
```

Publish package:

```bash
$ yarn publish --access public
```

Push git tags:

```bash
$ TAG=v`cat package.json | grep version | awk 'BEGIN { FS = "\"" } { print $4 }'`
$ git tag -a $TAG -m $TAG
$ git push origin $TAG
```
