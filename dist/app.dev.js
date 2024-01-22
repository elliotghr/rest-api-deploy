"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var express = require("express");

var crypto = require("node:crypto");

var movies = require("./movies.json");

var z = require("zod");

var PORT = 3000;
var app = express();
app.use(express.json());
app.disable("x-powered-by"); // Todos los recursos de MOVIES se identifican con /movies

app.get("/movies", function (req, res) {
  res.header("Access-Control-Allow-Origin", "http://192.168.56.1:8080");
  var genre = req.query.genre;

  if (genre) {
    var filteredMovies = movies.filter(function (movie) {
      return movie.genre.some(function (g) {
        return g.toLowerCase() === genre.toLowerCase();
      });
    });
    return res.json(filteredMovies);
  }

  res.json(movies);
}); // path-to-regex librería utilizada por NodeJS

app.get("/movies/:id", function (req, res) {
  var id = req.params.id;
  var movie = movies.find(function (movie) {
    return movie.id == id;
  });
  if (movie) return res.json(movie);
  res.status(404).json({
    message: "Movie not found"
  });
});
app.post("/movies", function (req, res) {
  // Validamos los datos
  var result = validateMovie(req.body);

  if (result.error) {
    return res.status(400).json({
      error: result.error.message
    });
  } // Usamos crypto para generar un UUID


  var newMovie = _objectSpread({
    id: crypto.randomUUID()
  }, result.data);

  movies.push(newMovie);
  res.status(201).json(newMovie);
});
app.patch("/movies/:id", function (req, res) {
  var result = validatePartialMovie(req.movie);

  if (!result.success) {
    return res.status(400).json({
      error: JSON.parse(result.error.message)
    });
  }

  var id = req.params.id;
  var movieIndex = movies.findIndex(function (movie) {
    return movie.id === id;
  });
  if (movieIndex === -1) return res.status(404).json({
    message: "Movie not found"
  });

  var updateMovie = _objectSpread({}, movies[movieIndex], {}, result.data);

  return res.json(updateMovie);
});
app["delete"]("/movies/:id", function (req, res) {
  var id = req.params.id;
  var movieIndex = movies.findIndex(function (movie) {
    return movie.id === id;
  });

  if (movieIndex === -1) {
    return res.status(404).json({
      message: "Movie not found"
    });
  }

  movies.splice(movieIndex, 1);
  return res.json({
    message: "Movie deleted"
  });
});
app.listen(PORT, function () {
  console.log("server listening on port http://localhost:".concat(PORT));
});