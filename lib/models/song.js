const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);

const all = () => database('songs')
  .select('id', 'name', 'artist_name', 'genre', 'song_rating');

const show = (songId) => database('songs')
  .select('id', 'name', 'artist_name', 'genre', 'song_rating')
  .where('id', songId);

const add = (song, addedSong) => database('songs')
  .insert(song, addedSong);

const edit = (songId, song, editedSong) => database('songs')
  .where('id', songId)
  .update(song, editedSong);

const remove = (songId) => database('songs')
  .where('id', songId)
  .del();

const allIds = () => database('songs')
  .pluck('id');


module.exports = {
  all,
  show,
  add,
  edit,
  remove,
  allIds
  }
