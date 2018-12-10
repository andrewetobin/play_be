const pry = require('pryjs')

const Song = require('./lib/models/song.js')
const Playlist = require('./lib/models/playlist.js')
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
  Song.all()
  .then((songs) => {
    response.status(200).json(songs);
  })
  .catch((error) => {
    response.status(500).json({ error });
  });
});

app.get('/api/v1/songs/:id', (request, response) => {
  const songId = request.params.id;
  Song.show(songId)
    .then((song) => {
      if (song.length) {
        response.status(200).json(song);
      } else {
        response.status(400).json({
          error: `Could not find song with id: ${songId}`
        });
      };
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
    };
  };

  if ((song['song_rating'] > 100) || (song['song_rating'] < 1)) {
    return response
      .status(400)
      .send( {error: `Song Rating: ${song['song_rating']} is invalid. Song rating must be an integer between 1 and 100.` } );
  };

  Song.add(song, ['id', 'name', 'artist_name', 'genre', 'song_rating'])
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
    };
  };

  Song.edit(songId, song, ['id', 'name', 'artist_name', 'genre', 'song_rating'])
    .then(song => {
      response.status(201).json({ songs: song[0] });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.delete('/api/v1/songs/:id', (request, response) => {
  const songId = request.params.id;

  Song.allIds()
    .then(idSet => {
      if (idSet.includes(parseInt(songId))) {
        Song.remove(songId)
          .then(() => {
            response.status(204).json({success: 'Song has been deleted.'})
          })
          .catch(error => ({ error }));
      } else {
        response.status(404).json({error: 'Cound not find song.'});
      };
    })
    .catch((error) => {
    response.status(500).json({ error });
  });
});

app.get('/api/v1/playlists', (request, response) => {
  let playlists = [];
  let songs = [];
  Playlist.all()
  .then((allPlaylists) => {
    playlists = allPlaylists
  });
  Playlist.linkAllSongs()
  .then((allSongs) => {
    songs = allSongs;
    for(let playlist of playlists) {
      playlist.songs = songs.filter(song => (song.playlist_id == playlist.id))
      playlist.songs.forEach(song => delete song.playlist_id)
    }
  })
  .then(() => {response.status(200).json(playlists)})
  .catch((error) => {
    response.status(500).json({ error });
  });
});

app.post('/api/v1/playlists', (request, response) => {
  const newPlaylist = request.body;

  if(!newPlaylist['playlist_name']) {
    return response
      .status(400)
      .send({ error: `Expected format: { playlist_name: <String> }.` });
  }

  Playlist.add(newPlaylist, ['id', 'playlist_name'])
    .then(addedPlaylist => {
      response.status(201).json({ playlist: addedPlaylist[0] })
    });
});

app.get('/api/v1/playlists/:id/songs', (request, response) => {
  let playlistResponse;
  let playlistId = request.params.id;

  Playlist.show(playlistId)
  .then(playlists => {
    if(playlists.length) {
      playlistResponse = playlists[0];
      Playlist.linkSongs(playlistId)
        .then(songs => {
          playlistResponse["songs"] = songs;
          response.status(200).json(playlistResponse);
        });
    } else {
      response.status(404).json({ error: `Playlist with ID: ${playlistId} does not exist` });
    };
  });
});

app.post('/api/v1/playlists/:playlist_id/songs/:id', (request, response) => {
  let targetSong;
  let targetPlaylist;

  Promise.all([Song.show(request.params.id)
    .then(song => {
      if (song.length) {
        targetSong = song[0];
      } else {
        response.status(404).json({
          message: `Could not find song.`
        });
      };
    })
    .catch(error => ({ error })),

  Playlist.show(request.params.playlist_id)
    .then(playlist => {
      if(playlist.length) {
        targetPlaylist = playlist[0];
      } else {
        response.status(404).json({
          message: `Could not find playlist.`
        });
      };
    })
    .catch(error => ({ error }))])
  .then(() => {
    if (targetSong && targetPlaylist) {
      let newPlaylistSong = {
        playlist_id: targetPlaylist.id,
        song_id: targetSong.id
      };
      Playlist.addSong(newPlaylistSong)
        .then(() => {
          response.status(201).json({
            message: `Successfully added ${targetSong.name} to playlist: ${targetPlaylist.playlist_name}`
          });
        })
        .catch(error => { error });
    } else {
      response.status(400).json({
        error: 'Something didn\'t go right, please try again.'
      });
    };
  });
});

app.delete('/api/v1/playlists/:playlist_id/songs/:id', (request, response) => {
  let targetSong;
  let targetPlaylist;

  Promise.all([Song.show(request.params.id)
  .then(song => { targetSong = song[0] }),

  Playlist.show(request.params.playlist_id)
  .then(playlist => { targetPlaylist = playlist[0] })
  ])
  .then(() => {
    Playlist.remove(targetSong, targetPlaylist)
    .then(() => {
      response.status(201).json({
        message: `Successfully removed ${targetSong.name} from playlist: ${targetPlaylist.playlist_name}.`
      })
    })
    .catch(error => {
      response.status(404).json({
        error: 'Could not remove song from playlist.'
      });
    });
  });
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

module.exports = app;
