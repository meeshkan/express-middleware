[![CircleCI](https://circleci.com/gh/Meeshkan/express-middleware.svg?style=svg)](https://circleci.com/gh/Meeshkan/express-middleware)

# Meeshkan express middleware

Express server middleware to log requests and responses in [http-types](https://meeshkan.github.io/http-types/) format.

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
    transports: [LocalFileSystemTransport("http-exchanges.jsonl"), customTransport],
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
