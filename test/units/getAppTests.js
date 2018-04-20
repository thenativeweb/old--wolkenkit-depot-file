'use strict';

const fs = require('fs'),
      path = require('path');

const assert = require('assertthat'),
      formats = require('formats'),
      isolated = require('isolated'),
      request = require('supertest');

const getApp = require('../../lib/getApp');

/* eslint-disable no-sync */
const certificate = fs.readFileSync(path.join(__dirname, '..', 'shared', 'keys', 'certificate.pem'));
/* eslint-enable no-sync */

suite('getApp', () => {
  test('is a function.', done => {
    assert.that(getApp).is.ofType('function');
    done();
  });

  test('throws an error if options are missing.', done => {
    assert.that(() => {
      getApp();
    }).is.throwing('Options are missing.');
    done();
  });

  test('throws an error if directory is missing.', done => {
    assert.that(() => {
      getApp({
        identityProvider: {
          name: '',
          certificate: ''
        }
      });
    }).is.throwing('Directory is missing.');
    done();
  });

  test('throws an error if identity provider is missing.', done => {
    assert.that(() => {
      getApp({
        directory: __dirname
      });
    }).is.throwing('Identity provider is missing.');
    done();
  });

  test('throws an error if identity provider name is missing.', done => {
    assert.that(() => {
      getApp({
        directory: __dirname,
        identityProvider: {
          certificate
        }
      });
    }).is.throwing('Identity provider name is missing.');
    done();
  });

  test('throws an error if identity provider certificate is missing.', done => {
    assert.that(() => {
      getApp({
        directory: __dirname,
        identityProvider: {
          name: 'auth.example.com'
        }
      });
    }).is.throwing('Identity provider certificate is missing.');
    done();
  });

  suite('app', () => {
    suite('GET /<id>', () => {
      test('returns a 400 if the id is malformed.', done => {
        isolated((errIsolated, directory) => {
          assert.that(errIsolated).is.null();

          const app = getApp({
            directory,
            identityProvider: {
              name: 'auth.example.com',
              certificate
            }
          });

          request(app).
            get('/foobar-8e7794b0-e66e-4756-b64a-c099ae3722c8').
            end((err, res) => {
              assert.that(err).is.null();
              assert.that(res.status).is.equalTo(400);
              done();
            });
        });
      });

      test('returns a 404 if the id is missing.', done => {
        isolated((errIsolated, directory) => {
          assert.that(errIsolated).is.null();

          const app = getApp({
            directory,
            identityProvider: {
              name: 'auth.example.com',
              certificate
            }
          });

          request(app).
            get('/').
            end((err, res) => {
              assert.that(err).is.null();
              assert.that(res.status).is.equalTo(404);
              done();
            });
        });
      });

      test('returns a 404 if the given id does not exist.', done => {
        isolated((errIsolated, directory) => {
          assert.that(errIsolated).is.null();

          const app = getApp({
            directory,
            identityProvider: {
              name: 'auth.example.com',
              certificate
            }
          });

          request(app).
            get('/c572bcd4-f68f-4940-a94c-c6b3587dfcf2').
            end((err, res) => {
              assert.that(err).is.null();
              assert.that(res.status).is.equalTo(404);
              done();
            });
        });
      });

      test('returns a 200 if the id exists.', done => {
        const id = 'c572bcd4-f68f-4940-a94c-c6b3587dfcf2';

        isolated({
          files: path.join(__dirname, '..', 'shared', 'storage', 'data', id)
        }, (errIsolated, directory) => {
          assert.that(errIsolated).is.null();

          const app = getApp({
            directory,
            identityProvider: {
              name: 'auth.example.com',
              certificate
            }
          });

          request(app).
            get('/c572bcd4-f68f-4940-a94c-c6b3587dfcf2').
            end((err, res) => {
              assert.that(err).is.null();
              assert.that(res.statusCode).is.equalTo(200);
              done();
            });
        });
      });

      test('returns the data for a given id.', done => {
        const id = 'c572bcd4-f68f-4940-a94c-c6b3587dfcf2';

        isolated({
          files: path.join(__dirname, '..', 'shared', 'storage', 'data', id)
        }, (errIsolated, directory) => {
          assert.that(errIsolated).is.null();

          const app = getApp({
            directory,
            identityProvider: {
              name: 'auth.example.com',
              certificate
            }
          });

          request(app).
            get('/c572bcd4-f68f-4940-a94c-c6b3587dfcf2').
            end((err, res) => {
              assert.that(err).is.null();
              assert.that(res.body.toString('utf8')).is.equalTo('foobar\n');
              done();
            });
        });
      });

      test('returns application/octet-stream for data of an unknown type.', done => {
        const id = 'c572bcd4-f68f-4940-a94c-c6b3587dfcf2';

        isolated({
          files: path.join(__dirname, '..', 'shared', 'storage', 'data', id)
        }, (errIsolated, directory) => {
          assert.that(errIsolated).is.null();

          const app = getApp({
            directory,
            identityProvider: {
              name: 'auth.example.com',
              certificate
            }
          });

          request(app).
            get('/c572bcd4-f68f-4940-a94c-c6b3587dfcf2').
            end((err, res) => {
              assert.that(err).is.null();
              assert.that(res.headers['content-type']).is.equalTo('application/octet-stream');
              done();
            });
        });
      });

      test('returns the appropriate mime type for a known type.', done => {
        const id = '932104d2-9929-40b4-8f3c-47912314da0d';

        isolated({
          files: path.join(__dirname, '..', 'shared', 'storage', 'data', id)
        }, (errIsolated, directory) => {
          assert.that(errIsolated).is.null();

          const app = getApp({
            directory,
            identityProvider: {
              name: 'auth.example.com',
              certificate
            }
          });

          request(app).
            get(`/${id}`).
            end((err, res) => {
              assert.that(err).is.null();
              assert.that(res.headers['content-type']).is.equalTo('image/png');
              done();
            });
        });
      });
    });

    suite('POST /', () => {
      test('returns a 200 if the data was written.', done => {
        isolated((errIsolated, directory) => {
          assert.that(errIsolated).is.null();

          const app = getApp({
            directory,
            identityProvider: {
              name: 'auth.example.com',
              certificate
            }
          });

          request(app).
            post('/').
            send('foobar').
            end((err, res) => {
              assert.that(err).is.null();
              assert.that(res.statusCode).is.equalTo(200);
              done();
            });
        });
      });

      test('returns an id if the data was written.', done => {
        isolated((errIsolated, directory) => {
          assert.that(errIsolated).is.null();

          const app = getApp({
            directory,
            identityProvider: {
              name: 'auth.example.com',
              certificate
            }
          });

          request(app).
            post('/').
            send('foobar').
            end((err, res) => {
              assert.that(err).is.null();
              assert.that(res.body).is.ofType('object');
              assert.that(formats.isUuid(res.body.id)).is.true();
              done();
            });
        });
      });
    });
  });
});
