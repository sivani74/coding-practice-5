const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server is running at http://localhost:3000/")
    );
  } catch (err) {
    console.log(`DB ERROR: ${err.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertMovieDb = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
        movie_name
    FROM
        movie;`;

  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray.map((eachMovie) => convertMovieDb(eachMovie)));
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const postMovieQuery = `
    INSERT INTO
        movie (director_id, movie_name, lead_actor)
    VALUES
        (${director_id}, '${movie_name}', '${lead_actor}');`;

  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;

  const getMovieQuery = `
    SELECT
    *
    FROM
    movie
    WHERE
    movie_id = ${movieId};`;

  const movie = await db.get(getMovieQuery);
  response.send(convertMovieDb(movie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
    UPDATE movie
            SET
              director_id = ${directorId},
              movie_name = '${movieName}',
              lead_actor = '${leadActor}'

            WHERE 
            movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE
    movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertDirectorDb = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getAllDirectorQuery = `
    SELECT
    *
    FROM
    director;`;
  const moviesArray = await db.all(getAllDirectorQuery);
  response.send(moviesArray.map((director) => convertDirectorDb(director)));
});

const convertMovieNamePascalCase = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieQuery = `
    SELECT
    movie_name
    FROM
    director INNER JOIN movie
    ON director.director_id = movie.director_id
    WHERE 
    director.director_id = ${director_id};`;

  const movies = await db.all(getDirectorMovieQuery);
  console.log(directorId);
  response.send(
    movies.map((movienames) => convertMovieNamePascalCase(movienames))
  );
});

module.exports = app;
