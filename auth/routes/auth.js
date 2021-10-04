const express = require('express');
const DebugControl = require('../utilities/debug.js');

let router;

const authRoutes = (oauthServer, authorize) => {
  if (typeof router !== 'undefined') {
    return router;
  }

  router = express.Router(); // Instantiate a new router

  router.get('/', (req, res) => {
    // send back a simple form for the oauth
    res.send({ ok: true });
  });

  router.post(
    '/authorize/:repository',
    async (req, res, next) => {
      DebugControl.log.flow('Initial User Authentication');
      try {
        const user = await authorize(req.params.repository, req.body);
        if (user) {
          req.body.user = user;
          return next();
        }
      } catch (err) {
        DebugControl.log.flow(`Error: ${JSON.stringify(err)}`);
      }
      const result = {
        success: false,
      };
      [
        // Send params back down
        'client_id',
        'redirect_uri',
        'response_type',
        'grant_type',
        'state',
      ].map((a) => (result[a] = req.body[a]));
      return res.send({ ...result });
    },
    (req, res, next) => {
      // sends us to our redirect with an authorization code in our url
      DebugControl.log.flow('Authorization');
      return next();
    },
    oauthServer.authorize({
      authenticateHandler: {
        handle: (req) => {
          DebugControl.log.functionName('Authenticate Handler');
          DebugControl.log.parameters(Object.keys(req.body).map((k) => ({ name: k, value: req.body[k] })));
          return req.body.user;
        },
      },
    }),
  );

  router.post(
    '/token',
    (req, res, next) => {
      DebugControl.log.flow('Token');
      next();
    },
    oauthServer.token({
      requireClientAuthentication: {
        // whether client needs to provide client_secret
        // 'authorization_code': false,
      },
    }),
  ); // Sends back token

  return router;
};

module.exports = authRoutes;
