const express = require('express');
const bodyParser = require('body-parser');
const oauthServerInit = require('./oauth/server.js');
const { setPort } = require('./port');
const DebugControl = require('./utilities/debug.js');
const fs = require('fs');
const https = require('https');

const startAuthServer = (tls, port, provider, authorize) => {
  setPort(port);

  const app = express();
  const oauthServer = oauthServerInit(provider);

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(DebugControl.log.request());

  app.use('/client', require('./routes/client.js')); // Client routes
  app.use('/oauth', require('./routes/auth.js')(oauthServer, authorize)); // routes to access the auth stuff
  // Note that the next router uses middleware. That protects all routes within this middleware
  app.use(
    '/oauth/verify',
    (req, res, next) => {
      DebugControl.log.flow('Authentication');
      return next();
    },
    oauthServer.authenticate(),
    (req, res) => {
      res.send({ success: true });
    },
  ); // routes to access the protected stuff
  app.use('/', (req, res) => res.redirect('/client'));

  const httpsServer = https.createServer(
    {
      key: fs.readFileSync(tls.SSL_KEY),
      cert: fs.readFileSync(tls.SSL_CERT),
      ca: fs.readFileSync(tls.SSL_CA),
      rejectUnauthorized: false,
    },
    app,
  );

  httpsServer.listen(port, () => {
    console.info(`Oauth Server listening on port ${port}`);
  });

  return httpsServer;
};

module.exports = {
  startAuthServer,
};
