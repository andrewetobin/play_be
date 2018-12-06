const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

chai.use(chaiHttp);

describe('Client Routes', () => {
  it("it's doing a thing", done => {
    chai.request(server)
      .get("/")
      .end((err, response) => {
        response.should.have.status(200);
        response.should.be.html;
        response.res.text.should.equal('Hello, Songs');
        done()
      })
  })
});

describe('API Routes', () => {
  before((done => {
    database.migrate.latest()
      .then( () => done())
      .catch(error => {
        throw error;
      });
  }));

  beforeEach((done) => {
    database.seed.run()
      .then( () => done())
      .catch(error => {
        throw error;
      });
  });

  after((done) => {

  });
});


