var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var db = require('./models/index.js');
var Songs = db.sequelize.model('song');
var Playlists = db.sequelize.model('playlist');

var server = http.createServer(function(request, response) {
  if(request.url == '/') {
    response.statusCode = 302;
    response.setHeader('Content-Type', 'text/html');
    response.setHeader("Location", "/playlists");
    response.end();
  }
  if(request.url == '/playlists' || request.url == '/search' || request.url == '/library') {
    var file = fs.createReadStream(path.join(__dirname, '/index.html'));
    file.on('error', function(err) {
      res.end(err);
    });
    file.on('open', function() {
      response.statusCode = 200;
      response.setHeader('Content-Type', 'text/html');
      response.setHeader('Cache-Control', 'public, max-age: 1800');
      file.pipe(response);
    });
  }
  if(request.url == '/api/songs') {
    var songsJson = {
      songs: []
    };
    Songs.findAll().then((songs) => {
      songs.map((song) => {
        var songToPush = {
          artist: song.artist,
          title: song.title,
          album: song.album,
          duration: song.duration,
          id: song.id-1
        };
        songsJson.songs.push(songToPush);
      });
      response.statusCode = 200;
      response.setHeader('Content-Type', 'text/json');
      response.setHeader('Cache-Control', 'public, max-age: 1800');
      response.end(JSON.stringify(songsJson));
    });
  }
  if(request.url == '/api/playlists') {
    if(request.method == 'POST') {
      var body = [];
      request.on('data', function(chunk) {
        body.push(chunk);
      }).on('end', function() {
        body = Buffer.concat(body).toString();
        body = JSON.parse(body);
        if(body.name) {
          fs.readFile(path.join(__dirname, '/playlists.json'), function(err, data) {
            if(err) {
              console.log(err);
            }
            else {
              var playlists = JSON.parse(data.toString())['playlists'];
              playlists.push(body);
              var updatedPlaylists = {
                'playlists': playlists
              }
              updatedPlaylists = JSON.stringify(updatedPlaylists);
              fs.writeFile(path.join(__dirname, '/playlists.json'), updatedPlaylists, function(err) {
                if(err) {
                  console.log(err);
                }
                else {
                  response.end('Added playlist!');
                }
              });
            }
          });
        }
        else {
          fs.readFile(path.join(__dirname, '/playlists.json'), function(err, data) {
            if(err) {
              console.log(err);
            }
            else {
              var playlists = JSON.parse(data.toString())['playlists'];
              var playlistToUpdate = playlists.filter(function(playlist) {
                return playlist.id == body.playlist;
              });
              playlistToUpdate[0].songs.push(parseInt(body.song, 10));
              var updatedPlaylists = {
                'playlists': playlists
              }
              updatedPlaylists = JSON.stringify(updatedPlaylists);
              fs.writeFile(path.join(__dirname, '/playlists.json'), updatedPlaylists, function(err) {
                if(err) {
                  console.log(err);
                }
                else {
                  response.end('Done!');
                }
              });
            }
          });
        }
      });
    }
    if(request.method == 'GET') {
      var playlistsJson = {
        playlists: []
      };
      var promises = [];
      Playlists.findAll().then((playlists) => {
        playlists.forEach((playlist) => {
          playlistsJson.playlists.push({
            id: playlist.id-1,
            name: playlist.name,
            songs: []
          });
          promises.push(playlist.getSongs());
        });
        Promise.all(promises).then((results) => {
          results.forEach((songs, index) => {
             songs.forEach((song) => {
              playlistsJson.playlists[index].songs.push(song.id-1);
            });
          });
          response.statusCode = 200;
          response.setHeader('Content-Type', 'text/json');
          response.setHeader('Cache-Control', 'public, max-age: 1800');
          response.end(JSON.stringify(playlistsJson));
        });
      });
    }
  }
  if(request.url == '/playlist.css') {
    var file = fs.createReadStream(path.join(__dirname, '/assets/css/style.css'));
    file.on('error', function(err) {
      response.end(err);
    });
    file.on('open', function() {
      response.statusCode = 200;
      response.setHeader('Content-Type', 'text/css');
      response.setHeader('Cache-Control', 'public, max-age: 1800');
      file.pipe(response);
    });
  }
  if(request.url == '/music-app.js') {
    var file = fs.createReadStream(path.join(__dirname, '/assets/js/music-app.js'));
    file.on('error', function(err) {
      response.end(err);
    });
    file.on('open', function() {
      response.statusCode = 200;
      response.setHeader('Content-Type', 'text/javascript');
      response.setHeader('Cache-Control', 'public, max-age: 1800');
      file.pipe(response);
    });
  }
});
server.listen(3000, function() {
    console.log('Started listening on port 3000!');
});
