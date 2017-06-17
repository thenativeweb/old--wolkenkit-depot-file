'use strict';

const cors = require('cors'),
      datendepot = require('datendepot'),
      express = require('express'),
      Limes = require('limes');

const getApp = function (options) {
  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.directory) {
    throw new Error('Directory is missing.');
  }
  if (!options.identityProvider) {
    throw new Error('Identity provider is missing.');
  }
  if (!options.identityProvider.name) {
    throw new Error('Identity provider name is missing.');
  }
  if (!options.identityProvider.certificate) {
    throw new Error('Identity provider certificate is missing.');
  }

  const limes = new Limes({
    identityProviderName: options.identityProvider.name,
    certificate: options.identityProvider.certificate
  });

  const app = express();

  app.use(cors());
  app.use(limes.verifyTokenMiddlewareExpress());
  app.use(datendepot({
    storage: 'File',
    options: {
      directory: options.directory
    }
  }));

  return app;
};

module.exports = getApp;
