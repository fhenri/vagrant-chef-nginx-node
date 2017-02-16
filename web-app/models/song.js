module.exports = function(db, Sequelize) {
    var song = db.define('song', {
        album: Sequelize.STRING,
        title: Sequelize.STRING,
        artist: Sequelize.STRING,
        duration: Sequelize.INTEGER
    });

    return song;
};
