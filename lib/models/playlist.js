const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);

const all = () => database('playlists')
  .select('id', 'playlist_name');

const linkAllSongs = () => database('songs')
  .select('songs.id', 'name', 'artist_name', 'genre', 'song_rating', 'playlist_songs.playlist_id')
  .join('playlist_songs', 'songs.id', 'playlist_songs.song_id');

const add = (playlist, addedPlaylist) => database('playlists').insert(playlist, addedPlaylist);

const linkSongs = (playlistId) => database('playlist_songs')
  .where('playlist_id', playlistId)
  .select(['songs.id', 'name', 'artist_name', 'genre', 'song_rating'])
  .join('songs', {'songs.id': 'playlist_songs.song_id'});


const show = (playlistId) => database('playlists').where('id', playlistId).select(['id', 'playlist_name']);



module.exports = {
  all,
  linkAllSongs,
  add,
  linkSongs,
  show
  // edit,
  // remove,
  // allIds
  }
