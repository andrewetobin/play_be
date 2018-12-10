const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);

const all = () => database('playlists')
  .select('id', 'playlist_name');

const linkSongs = () => database('songs')
  .select(['songs.id', 'name', 'artist_name', 'genre', 'song_rating', 'playlist_songs.playlist_id'])
  .join('playlist_songs', 'songs.id', 'playlist_songs.song_id');



module.exports = {
  all,
  linkSongs
  // show,
  // add,
  // edit,
  // remove,
  // allIds
  }
