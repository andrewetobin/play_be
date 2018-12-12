# Play (Back End)

Visit the deployed API here: https://play-be.herokuapp.com/

## Learning Objectives
  - Strengthen team communication through paired programming
  - Build back end API endpoints using Node.js, Express, and Knex
  - Build database with PostgreSQL
  - TDD using Mocha/Chai/chaiHttp
  - Use JavaScript/JQuery to build the front end to consume the API endpoints
  - Build out front end

**Front End**

  Visit the front end github repo here: https://github.com/KathleenYruegas/play_fe

  Visit the front end deployed site here: https://play-project.herokuapp.com/

###### Core Contributors
  - Andrew Tobin | github.com/andrewetobin
  - Kathleen Yruegas | github.com/kathleenyruegas

## Setup

- Fork or clone this repo
- run `npm install`
- Run `npm start` to spin up the server

## Testing
- Run the test suite with `npm test`
- Current test report:
<em><img href='./test_coverage.png'></em>

## Endpoints

**GET `/api/v1/favorites`**
 - This will provide a list of all songs the user has added as a favorite. A song is not stored in the database until it is favorited.

Example Response:
```json
[
  {
    "id": 35,
    "name": "Bohemian Rhapsody",
    "artist_name": "Queen",
    "genre": "Rock",
    "song_rating": 100
  },
  {
    "id": 36,
    "name": "Another One Bites the Dust",
    "artist_name": "Queen",
    "genre": "Rock",
    "song_rating": 85
  }
]
```

**GET `/api/v1/songs/:id`**
- Provides data for a specific song.
Example Response:
```json
[
  {
    "id": 35,
    "name": "Bohemian Rhapsody",
    "artist_name": "Queen",
    "genre": "Rock",
    "song_rating": 100
  }
]
```

**POST `/api/v1/songs`**
- Adds a song to the database as a user favorite.

Expected Request Format:
```json
[
  {
    "name": "Thriller",
    "artist_name": "Michael Jackson",
    "genre": "Pop",
    "song_rating": 92
  }
]
```

Example Response:
```json
[
  {
    "songs": {
      "id": 5,
      "name": "Thriller",
      "artist_name": "Michael Jackson",
      "genre": "Pop",
      "song_rating": 92
    }
  }
]
```

*An error will produce:*
- The post request will error if one of the parameters are missing of if the song rating is outside of the range (0, 100).
```json
{
  "error": "Expected format: { name: <String>, artist_name: <String>, genre: <String>, song_rating: <Integer> }. You're missing a 'name' property."
}
```

**Patch `/api/v1/songs/:id`**
- Allows user to update an existing song.
Expected Request Format:
```json
[
  {
    "name": "New Song",
    "artist_name": "Michael Jackson",
    "genre": "Pop",
    "song_rating": 92  
  }
]
```

Example Response:
```json
[
  {
    "songs": {
      "id": 5,
      "name": "New Song",
      "artist_name": "Michael Jackson",
      "genre": "Pop",
      "song_rating": 92
    }
  }
]
```
*An error will produce:*
- The patch request requires all parameters to be present.
Example Error:
```json
{
  "error": "Expected format: { name: <String>, artist_name: <String>, genre: <String>, song_rating: <Integer> }. You're missing a 'name' property."
}
```

**DELETE `/api/v1/songs/:id`**
- Deletes specified song.
- Successful Response:
`status: 204`
- Unsuccessful Response:
`status: 404`

**GET `/api/v1/playlists`**
- Will return all playlists and each song associated with each playlist.
Example Response:
```json
[
    {
      "id": 34,
      "playlist_name": "Workout Songs",
      "songs": []
    },
    {
      "id": 35,
      "playlist_name": "Wedding Songs",
      "songs": [
          {
            "id": 36,
            "name": "Another One Bites the Dust",
            "artist_name": "Queen",
            "genre": "Rock",
            "song_rating": 85
          }
        ]
    }
]
```

**POST `/api/v1/playlists`**
- Will add a new playlist.
Expected Request Format:
```json
[
  {
    "playlist_name": "Coding Jams"
  }
]
```

Example Response:
```json
[
  {
    "playlist": {
      "id": 36,
      "playlist_name": "Coding Jams"
    }
  }
]
```
*An Error Will Produce:*
- If `playlist_name` is missing:
```json
{
  "error": "Expected format: { playlist_name: <String> }."
}
```
**GET `/api/v1/playlists/:playlist_id/songs`**
- Returns a specific playlist and all the songs associated with that playlist.
Example Response:
```json
[
  {
    "id": 35,
    "playlist_name": "Wedding Songs",
    "songs": [
        {
          "id": 35,
          "name": "Bohemian Rhapsody",
          "artist_name": "Queen",
          "genre": "Rock",
          "song_rating": 100
        },
        {
          "id": 36,
          "name": "Another One Bites the Dust",
          "artist_name": "Queen",
          "genre": "Rock",
          "song_rating": 85
        }
    ]
  }
]
```

**POST `/api/v1/playlists/:playlist_id/songs/:id`**
- Adds a song that's already in the database to a given playlist.
- No additional information is needed in request.
Successful Response:
```json
{
    "message": "Successfully added Bohemian Rhapsody to playlist: Wedding Songs"
}
```
An error will produce `status: 404`

**DELETE `/api/v1/playlists/:playlist_id/songs/:id`**
- Removes the song from the playlist. Song and playlist both persist in database.
Successful Response:
```json
{
    "message": "Successfully removed Another One Bites the Dust from playlist: Workout Songs."
}
```
An error will produce `status: 400`
