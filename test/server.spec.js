const request = require('supertest');
const server = require('../server/core');

describe( 'tribal server', function() {

  it( 'returns status 200 in response to GET /', function() {
    // return is important; this is an asychronous operation, and it returns a promise
    // without the return, mocha doesn't know when the test has completed
    return request(server)
      .get('/')
      .expect(200);
  });
});
