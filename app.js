'use strict';

const fs = require('fs'),
      path = require('path'),
      { promisify } = require('util');

const processenv = require('processenv'),
      spdy = require('spdy'),
      tailwind = require('tailwind');

const getApp = require('./lib/getApp');

const readFile = promisify(fs.readFile);

const blobsDirectory = processenv('BLOBS') || '/blobs',
      keysDirectory = processenv('KEYS');

const port = processenv('PORT') || 443,
      statusCorsOrigin = processenv('STATUS_CORS_ORIGIN') || '*',
      statusPort = processenv('STATUS_PORT') || 3333;

(async () => {
  const keys = {
    privateKey: await readFile(path.join(keysDirectory, 'privateKey.pem'), { encoding: 'utf8' }),
    certificate: await readFile(path.join(keysDirectory, 'certificate.pem'), { encoding: 'utf8' })
  };

  const app = tailwind.createApp({});

  await app.status.use(new app.wires.status.http.Server({
    port: statusPort,
    corsOrigin: statusCorsOrigin
  }));

  spdy.createServer({
    key: keys.privateKey,
    cert: keys.certificate
  }, getApp({
    directory: blobsDirectory,
    identityProvider: {
      name: processenv('IDENTITYPROVIDER_NAME'),
      certificate: processenv('IDENTITYPROVIDER_CERTIFICATE')
    }
  })).listen(port);
})();
