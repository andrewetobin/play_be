
exports.seed = function (knex, Promise) {
  return knex('playlist_songs').del()
    .then(() => knex('playlists').del())
    .then(() => knex('songs').del())
    .then(() => {
      return Promise.all([
        knex('songs').insert({ name: 'Bohemian Rhapsody', artist_name: 'Queen', genre: 'Rock', song_rating: 100 }, 'id')
          .then(song1 => {
            return knex('songs').insert({ name: 'Another One Bites the Dust', artist_name: 'Queen', genre: 'Rock', song_rating: 85 }, 'id')
            .then(song2 => {
              return knex('playlists').insert({playlist_name: 'Workout Songs'}, 'id')
              .then(playlist1 => {
                return knex('playlists').insert({playlist_name: 'Wedding Songs'}, 'id')
                .then(playlist2 => {
                  return knex('playlist_songs').insert({song_id: song1[0], playlist_id: playlist1[0]})
                  .then(() => {
                    return knex('playlist_songs').insert({song_id: song2[0], playlist_id: playlist2[0]})
                    .then(() => {
                      return knex('playlist_songs').insert({song_id: song2[0], playlist_id: playlist1[0]})
                    })
                  })
                })
              })
            })
          })
          .then(() => console.log('Seeding complete!'))
          .catch(error => console.log(`Error seeding data: ${error}`))
      ])
    })
    .catch(error => console.log(`Error seeding data: ${error}`));
};
