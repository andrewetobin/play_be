const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);

const all = () => database('playlists')
  .select('id', 'playlist_name');

const linkSongs = () => database('songs')
  .select('songs.id', 'name', 'artist_name', 'genre', 'song_rating', 'playlist_songs.playlist_id')
  .join('playlist_songs', 'songs.id', 'playlist_songs.song_id');

const add = (playlist, addedPlaylist) => database('playlists').insert(playlist, addedPlaylist);



module.exports = {
  all,
  linkSongs,
  add,
  // show,
  // edit,
  // remove,
  // allIds
  }
