const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);

const all = () => database('songs').select('id', 'name', 'artist_name', 'genre', 'song_rating');

const show = (songId) => database('songs')
  .select('id', 'name', 'artist_name', 'genre', 'song_rating')
  .where('id', songId);

const add = (song, addedSong) => database('songs')
  .insert(song, addedSong);

const edit = (songId, song, editedSong) => database('songs').where('id', songId).update(song, editedSong);


module.exports = {
  all,
  show,
  add,
  edit
  }
