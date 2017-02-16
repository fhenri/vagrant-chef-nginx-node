var fs = require('fs');
var Sequelize = require('sequelize');
var db = require('./models/index.js');
var Song = db.sequelize.models['song'];
var Playlist = db.sequelize.models['playlist'];
var SongsPlaylists = db.sequelize.models['SongsPlaylists'];

Song.sync().then(() => {
  console.log("Songs created!");
  fs.readFile('songs.json', (err, data) => {
    if(err) console.error("Error reading file songs.json", err);
    else {
      data = JSON.parse(data);
      var songsArray = data.songs;
      songsArray.map((song) => {
        var songToInsert = {
          title: song.title,
          album: song.album,
          artist: song.artist,
          duration: song.duration
        };
        Song.create(songToInsert).then(() => {
          console.log("Inserted " + song.id + ". song");
        }).catch((e) => {
          console.error("Failed to insert " + song.id + ". song", e);
        });
      });
    }
  });
}).catch(e => console.error("Something went wrong", e));

Playlist.sync().then(() => {
  console.log("Playlists created!");
  fs.readFile('playlists.json', (err, data) => {
    if(err) console.error("Error reading file songs.json", err);
    else {
      data = JSON.parse(data);
      var playlistsArray = data.playlists;
      playlistsArray.map((playlist) => {
        var playlistToInsert = {
          name: playlist.name
        };
        Playlist.create(playlistToInsert).then((instance) => {
          console.log("Inserted " + playlist.id + ". playlist");
        }).catch((e) => {
          console.error("Failed to insert " + playlist.id + ". playlist", e);
        });
        console.log(Playlist);
      });
    }
  });
}).catch(e => console.error("Something went wrong", e));

SongsPlaylists.sync().then(() => {
  fs.readFile('playlists.json', (err, data) => {
    if(err) console.error("Error readin playlists.json", err);
    else {
      data = JSON.parse(data);
      var playlists = data.playlists;
      Playlist.findAll().then((playlistsArray) => {
        playlistsArray.map((playlistInstance) => {
          playlistInstance.addSongs(playlists[playlistInstance.id-1].songs.map((song) => { return song+1}));
        });
      });
    }
  });
}).catch(e => console.error("Something went wrong", e));
