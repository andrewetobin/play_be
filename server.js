const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require('dotenv').config();
const myApiKey = process.env.MUSIXMATCH_API_KEY;

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 3000);
app.locals.title = 'Songs';

app.get('/search', (request, response) => {
  const artist = request.params.artist;
  debugger;
  const url = `https://api.musixmatch.com/ws/1.1/track.search?apikey=${myApiKey}&q_artist=${artist}`

  fetch(url)
    .then(response => response.json())
    .then(songs => formatSongs(songs))
    .catch(error => console.error({ error }));

  const formatSongs = (songs) => {
    console.log(songs);
  };
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

module.exports = app;
