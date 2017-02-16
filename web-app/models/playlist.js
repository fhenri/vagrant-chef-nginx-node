module.exports = function(db, Sequelize) {
  var playlist = db.define('playlist', {
    name: Sequelize.STRING
  });
  return playlist;
}
