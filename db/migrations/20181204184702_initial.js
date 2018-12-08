exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('songs', function(table) {
      table.increments('id').primary();
      table.string('name');
      table.string('artist_name');
      table.string('genre');
      table.integer('song_rating');

      table.timestamps(true, true);
    }),
    knex.schema.createTable('playlists', function(table) {
      table.increments('id').primary();
      table.string('playlist_name');

      table.timestamps(true, true);
    }),

    knex.schema.createTable('playlist_songs', function(table) {
      table.increments('id').primary();
      table.integer('song_id').unsigned()
      table.foreign('song_id')
        .references('songs.id');
      table.integer('playlist_id').unsigned()
      table.foreign('playlist_id')
        .references('playlists.id');

      table.timestamps(true, true);
    })
  ])
};


exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('songs'),
    knex.schema.dropTable('playlists'),
    knex.schema.dropTable('playlistSongs')
  ]);
}
