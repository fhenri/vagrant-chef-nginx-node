var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var sequelize = new Sequelize(null, null, null, {dialect: 'sqlite', storage: 'music.db'})

var db = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

  db['song'].belongsToMany(db['playlist'], {through: 'SongsPlaylists'});
  db['playlist'].belongsToMany(db['song'], {through: 'SongsPlaylists'});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
