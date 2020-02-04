# express middleware

Middleware to log requests and responses for `express` servers.

Basically a wrapper for the `express-winston` package + headers.

Add this middleware before adding routes, otherwise it won't work.

```javascript
const mw = require('@meeshkan/express-middleware');
app.use(mw({ path: 'log.jsonl' }));
// add routes
```