const pry = require('pryjs')

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
    database.migrate.rollback()
    .then(() => database.migrate.latest())
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
        });
    });
  });

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
        });
      };
    });

    it('responds 400 when song not found', done => {
      chai.request(server)
      .get(`/api/v1/songs/1`)
      .end((error, response) => {
        response.should.have.status(400);
        done();
      });
    });
  });

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
  });


  describe('PATCH /api/v1/songs/:id', () => {
    xit('should edit the given song', (done) => {
      let testSongName;
      let testSongArtist;
      database('songs').select().where('artist_name', 'Queen').limit(1)
        .then(song => {
        testSongName = song[0].name;
        testSongArtist = song[0].artist_name;
        chai.request(server)
          .patch(`/api/v1/songs/${song[0].id}`)
          .send({
            name: 'New Song',
            artist_name: 'Queen',
            genre: "Rock",
            song_rating: 84
          })
          .end((err, response) => {
            response.should.have.status(201);
            response.body.should.be.a('object');
            response.body.should.have.property('songs');
            response.body.songs.should.have.property('name').eql('New Song');
            response.body.songs.should.have.property('artist_name').eql('Queen');
          });
          done();
        });
      });
    });


  describe('DELETE /api/v1/songs/:id', () => {
    it('should successfully delete specified song', done => {
      database('songs').select('*')
        .then(songs => {
          const lengthBeforeDelete = songs.length;
          const song = songs[0];
          chai.request(server)
            .delete(`/api/v1/songs/${song.id}`)
            .end((err, response) => {
              response.should.have.status(204);
          database('songs').select('*')
            .then(updatedSongs => {
              updatedSongs.length.should.equal(lengthBeforeDelete - 1);
            });
          });
          done();
        });
    });

    it('should return 404 if song not in db', done => {
      let testSongId;
      database('songs').first('id')
        .then(song => {
          chai.request(server)
            .delete(`/api/v1/songs/${song.id + 3}`)
            .end((err, response) => {
              response.should.have.status(404);
        });
      });
      done();
    });
  });

  describe('/api/v1/playlists', () => {
    it('should return the specified playlist', done => {
      chai.request(server)
      .get("/api/v1/playlists")
      .end((err, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body[0].playlist_name.should.equal("Workout Songs");
        response.body[0].songs[0].name.should.equal("Bohemian Rhapsody");
        response.body[0].songs[0].artist_name.should.equal("Queen");
        response.body[0].songs[0].genre.should.equal("Rock");
        response.body[0].songs[0].song_rating.should.equal(100);
        response.body[0].songs[1].name.should.equal("Another One Bites the Dust");
        response.body[1].playlist_name.should.equal("Wedding Songs");
        response.body[0].songs[0].should.have.property('name');
        response.body[0].songs[0].should.have.property('artist_name');
        response.body[0].songs[0].should.have.property('genre');
        response.body[0].songs[0].should.have.property('song_rating');
        done();
      });
    });
  });
  describe('GET /api/v1/playlists/:playlist_id/songs', () => {
    it('should return all songs in a specific playlist', done => {
      database('playlists').select('*').then(data => resolve(data))
      function resolve(playlist){
        chai.request(server)
        .get(`/api/v1/playlists/${playlist[0].id}/songs`)
        .end((error, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.playlist_name.should.equal("Workout Songs");
          response.body.songs.length.should.equal(2);
          response.body.songs[1].name.should.equal("Another One Bites the Dust");
          response.body.songs[1].should.have.property('name');
          response.body.songs[1].should.have.property('artist_name');
          response.body.songs[1].should.have.property('genre');
          response.body.songs[1].should.have.property('song_rating');
          response.body.should.have.property('playlist_name');
          response.body.should.have.property('songs');
          done();
        });
      };
    });
  });
  it('should return 404 if given invalid playlist', (done) => {
    chai.request(server)
    .get('/api/v1/playlists/123/songs')
    .end((error, response) => {
      response.should.have.status(404);
      response.should.be.json;
      response.should.be.a('Object');
      response.should.have.property('error');
      response.body.error.should.equal('Playlist with ID: 123 does not exist');
      done();
    })
  });

  describe('POST /api/v1/playlists/:playlist_id/songs/:id', () =>{
    it('should add the given song to the given playlist', done => {
      let newSongParams = {
        name: "New Song 123",
        artist_name: "Kandrew",
        genre: "Coding Rock",
        song_rating: 99
      };

      let testPlaylist;
      database('playlists').first()
        .then(playlist => { playlist = testPlaylist});

      database('songs').insert(newSongParams)
        .then(newSong => {
          chai.request(server)
          .post(`/api/v1/playlists/${testPlaylist.id}/songs}`)
          .send({
            playlist_id: testPlaylist.id,
            song_id: newSong.id
          })
          .end((err, response) => {
            response.should.have.status(201);
            response.body.should.be(`message: Successfully added ${newSongParams.name}
              to playlist ${playlist.name}`);

            database('playlist_songs').select('*').orderBy('created_at desc').limit(1)
            .then(playlistSongEntry => {
              playlistSongEntry.playlist_id.should.equal(testPlaylist.id);
              playlistSongEntry.song_id.should.equal(newSong.id);
            });
            done();
          });
        });
    });
  });
});
