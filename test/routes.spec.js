const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

chai.use(chaiHttp);

describe('Client Routes', () => {
  it('should return list of songs', done => {
    chai.request(server)
    .get('/search')
    .end((err, response) => {
      response.should.have.status(200);
      response.should.be.json;
      response.res.text.should.equal({});
      done();
    });
  });
});

describe('API Routes', () => {
  // before((done) => {
  //   database.migrate.latest()
  //   .then(() => done())
  //   .catch(error => {
  //     throw error;
  //  });
// });

  // beforeEach((done) => {
  //   database.seed.run()
  //     .then(() => done())
  //     .catch(error => {
  //       throw error;
  //     });
  //   });

    it('returns list of songs', () => {

    })
});
