const pry = require('pryjs')

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 3000);
app.locals.title = 'Songs';

app.get('/api/v1/favorites', (request, response) => {
  database('songs').select('id', 'name', 'artist_name', 'genre', 'song_rating')
    .then((songs) => {
      response.status(200).json(songs);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/songs/:id', (request, response) => {
  const song_id = request.params.id;
  database('songs')
    .select('id', 'name', 'artist_name', 'genre', 'song_rating')
    .where('id', song_id)
    .then((song) => {
      if (song.length) {
        response.status(200).json(song);
      } else {
        response.status(400).json({
          error: `Could not find song with id: ${song_id}`
        });
      }
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});
app.post('/api/v1/songs', (request, response) => {
  const song = request.body;
  const requiredParameter = ['name', 'artist_name', 'genre', 'song_rating'];

  for (let parameter of requiredParameter) {
    if (!song[parameter]) {
      return response
        .status(400)
        .send({ error: `Expected format: { name: <String>, artist_name: <String>, genre: <String>, song_rating: <Integer> }. You're missing a "${parameter}" property.` });
    }
  }

  if ((song['song_rating'] > 100) || (song['song_rating'] < 1)) {
    return response
      .status(400)
      .send( {error: `Song Rating: ${song['song_rating']} is invalid. Song rating must be an integer between 1 and 100.` } );
  }

  database('songs').insert(song, ['id', 'name', 'artist_name', 'genre', 'song_rating'])
    .then(song => {
      response.status(201).json({ songs: song[0] })
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.patch('/api/v1/songs/:id', (request, response) => {
  const songId = request.params.id;
  const song = request.body;
  const requiredParameter = ['name', 'artist_name', 'genre', 'song_rating'];

  for(let parameter of requiredParameter) {
    if(!song[parameter]) {
      return response
        .status(400)
        .send({ error: `Expected format: { name: <String>, artist_name: <String>, genre: <String>, song_rating: <Integer> }.
          You're missing a "${requiredParameter}" property.`});
    }
  }

  database('songs').where('id', songId).update(song, ['id', 'name', 'artist_name', 'genre', 'song_rating'])
    .then(song => {
      response.status(201).json({ songs: song[0] });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/playlists', (request, response) => {
  database('playlistSongs').select('playlist_id', 'playlist_name', 'songs')
    .then((playlists) => {
      response.status(200).json(playlists);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

module.exports = app;
