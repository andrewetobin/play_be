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
  })
  describe('/api/v1/songs/:id', () => {
    it('responds to /api/v1/songs/:id', done => {
      database('songs').select('*').then(data => resolve(data))
      function resolve(song){
        chai.request(server)
        .get(`/api/v1/songs/${song[0].id}`)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.length.should.equal(1);
          response.body[0].name.should.equal(song[0].name)
          response.body[0].artist_name.should.equal(song[0].artist_name)
          done();
        })
      }
    })
    it('responds 400 when song not found', done => {
      chai.request(server)
      .get(`/api/v1/songs/1`)
      .end((error, response) => {
        response.should.have.status(400);
        done();
      })
    })
  })
  describe('POST /api/v1/songs', () => {
    it('should create a new song', done => {
      chai.request(server)
        .post('/api/v1/songs')
        .send({
          name: 'Under Pressure',
          artist_name: "Queen",
          genre: "Rock",
          song_rating: 84
        })
        .end((err, response) => {
          response.should.have.status(201);
          response.should.have.be.json;
          response.body.should.be.a('object');
          response.body.songs.should.have.property('name');
          response.body.songs.should.have.property('id');
          response.body.songs.should.have.property('genre');
          response.body.songs['name'].should.equal('Under Pressure');
          done();
      });
    });
    it('should not create a song with rating above range', done => {
      chai.request(server)
        .post('/api/v1/songs')
        .send({
          name: 'Under Pressure',
          artist_name: "Queen",
          genre: "Rock",
          song_rating: 101
        })
        .end((err, response) => {
          response.should.have.status(400);
          response.should.have.be.json;
          response.body.error.should.equal('Song Rating: 101 is invalid. Song rating must be an integer between 1 and 100.');
          done();
      });
    });
    it('should not create a song with rating below range', done => {
      chai.request(server)
        .post('/api/v1/songs')
        .send({
          name: 'Under Pressure',
          artist_name: "Queen",
          genre: "Rock",
          song_rating: -1
        })
        .end((err, response) => {
          response.should.have.status(400);
          response.should.have.be.json;
          response.body.error.should.equal('Song Rating: -1 is invalid. Song rating must be an integer between 1 and 100.');
          done();
      });
    });
    it('should not create a song with missing parameter', done => {
      chai.request(server)
        .post('/api/v1/songs')
        .send({
          artist_name: "Queen",
          genre: "Rock",
          song_rating: 84
        })
        .end((err, response) => {
          response.should.have.status(400);
          response.should.have.be.json;
          response.body.error.should.equal('Expected format: { name: <String>, artist_name: <String>, genre: <String>, song_rating: <Integer> }. You\'re missing a "name" property.');
          done();
      });
    });

    describe('PATCH /api/v1/songs:id', () => {
      it('should edit the given song', (done) => {
        let testSongName;
        let testSongArtist;
        database('songs').select().where('artist_name', 'Queen' ).limit(1)
          .then(song => updateSong(song))

        const updateSong = (song) => {
          testSongName = song.name;
          testSongArtist = song.artist_name;
          chai.request(server)
            .patch(`/api/v1/songs/${song.id}`)
            .send({
              name: 'New Song',
              artist_name: 'Queen',
              genre: "Rock",
              song_rating: 84
            })
            .end((err, response) => {
              response.should.have.status(200);
              response.body.should.be.a(Object);
              response.body.should.have.property('songs');
              response.body[0].should.have.property('name').eql('New Song');
              response.body[0].should.have.property('artist_name').eql('Queen');
            })
            done();
        };
      });
    });
  });
});
