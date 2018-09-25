const express = require('express');
const fileLoader = require('./routes/dyamicLoader');

const app = express();

app.get('/loadfile/:url', loader);

function loader(req, res, next) {
  const url = req.params.url;
  fileLoader(url, function () {
    res.status(404);
    res.json({error: "failed to load " + url});
  }, function (response) {
    const keys = Object.keys(response)
    res.send(keys);
  });
}

module.exports = app;
