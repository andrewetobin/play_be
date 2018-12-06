const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

chai.use(chaiHttp);

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

  describe('/api/v1/favorites', () => {
    it("getting response from api/v1/favorites", done => {
      chai.request(server)
        .get("/api/v1/favorites")
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body[0].should.have.property('id');
          response.body[0].should.have.property('name');
          response.body[0].should.have.property('artist_name');
          response.body[0].should.have.property('genre');
          response.body[0].should.have.property('song_rating');
          done()
        })
    })
  });
});
