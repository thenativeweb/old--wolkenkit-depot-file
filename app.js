'use strict';

const fs = require('fs'),
      path = require('path');

const processEnv = require('processenv'),
      spdy = require('spdy');

const getApp = require('./lib/getApp');

const blobsDirectory = processEnv('BLOBS') || '/blobs',
      keysDirectory = processEnv('KEYS');

const keys = {
  /* eslint-disable no-sync */
  privateKey: fs.readFileSync(path.join(keysDirectory, 'privateKey.pem'), { encoding: 'utf8' }),
  certificate: fs.readFileSync(path.join(keysDirectory, 'certificate.pem'), { encoding: 'utf8' })
  /* eslint-enable no-sync */
};

spdy.createServer({
  key: keys.privateKey,
  cert: keys.certificate
}, getApp({
  directory: blobsDirectory,
  identityProvider: {
    name: processEnv('IDENTITYPROVIDER_NAME'),
    certificate: processEnv('IDENTITYPROVIDER_CERTIFICATE')
  }
})).listen(443);
