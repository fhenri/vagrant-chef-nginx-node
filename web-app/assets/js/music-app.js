$(document).ready(function() {
  window.MUSIC_DATA = new Object;
  window.MUSIC_DATA.songs = [];
  window.MUSIC_DATA.playlists = [];
  window.SELECTED_SONG = null;
  $.getJSON('/api/songs', function(songs) {
    window.MUSIC_DATA.songs = $.map(songs, function(song) {
      return song;
    });
    renderSongs('songs-container-ul', window.MUSIC_DATA.songs);
    sortBy('song-artist');
  });
  $.getJSON('/api/playlists', function(playlists) {
    window.MUSIC_DATA.playlists = $.map(playlists, function(playlist) {
      return playlist;
    });
    renderPlaylists('playlists-container-ul', window.MUSIC_DATA.playlists);
  });
  $('tab-switch > a').click(checkUrl);
  clientRouter(window.location.pathname);
});
function clientRouter(url) {
  if(url == '/library') {
    $('.tab-switch--active').removeClass('tab-switch--active');
    $('#tab-switch--songs').parent().addClass('tab-switch--active');
    $('.main-container__tab--active').removeClass('main-container__tab--active');
    $('#songs-container').addClass('main-container__tab--active');
  }
  if(url == '/search') {
    $('.tab-switch--active').removeClass('tab-switch--active');
    $('#tab-switch--search').parent().addClass('tab-switch--active');
    $('.main-container__tab--active').removeClass('main-container__tab--active');
    $('#search-container').addClass('main-container__tab--active');
  }
  if(url == '/playlists') {
    $('.tab-switch--active').removeClass('tab-switch--active');
    $('#tab-switch--playlists').parent().addClass('tab-switch--active');
    $('.main-container__tab--active').removeClass('main-container__tab--active');
    $('#playlists-container').addClass('main-container__tab--active');
  }
}
function checkUrl(e) {
  e.preventDefault();
}
function selectPlaylist(event) {
  var e = event;
  var playlistId = e.target.getAttribute('id');
  var selectedPlaylist = window.MUSIC_DATA.playlists.filter(function(playlist) {
    return playlist.id == playlistId;
  });
  var postObject = {
    playlist: playlistId,
    song: window.SELECTED_SONG
  }
  postObject = JSON.stringify(postObject);
  $.post('/api/playlists', postObject, function(data) {
    if(data == 'Done!') {
      selectedPlaylist[0].songs.push(window.SELECTED_SONG);
      document.getElementsByClassName('modal-container')[0].style.display = 'none';
      var selectedSong = window.MUSIC_DATA.songs.filter(function(song) {
        return song.id == window.SELECTED_SONG;
      });
      document.getElementById('songs-in-playlist-ul' + playlistId).appendChild(renderSong(selectedSong[0]));
    }

  });
}
function changeView(e) {
  e.preventDefault();
  checkUrl();
}
function renderSong(song) {
  var songItem = document.createElement('li');
  songItem.className = 'song-item';
  var songCover = document.createElement('div');
  songCover.className = 'song-cover';
  var songMeta = document.createElement('div');
  songMeta.className = 'song-meta';
  var songTitle = document.createElement('p');
  songTitle.className = 'song-title';
  songTitle.appendChild(document.createTextNode(song.title));
  var songArtist = document.createElement('p');
  songArtist.className = 'song-artist';
  songArtist.appendChild(document.createTextNode(song.artist));
  var songActions = document.createElement('div');
  songActions.className = 'song-actions';
  var add = document.createElement('span');
  add.className = 'glyphicon glyphicon-plus-sign';
  add.setAttribute("id", song.id);
  add.onclick = addToPlaylist;
  var play = document.createElement('span');
  play.className = 'glyphicon glyphicon-play';
  songMeta.appendChild(songTitle);
  songMeta.appendChild(songArtist);
  songActions.appendChild(play);
  songActions.appendChild(add);
  songItem.appendChild(songCover);
  songItem.appendChild(songMeta);
  songItem.appendChild(songActions);
  return songItem;
}
function renderSongs(containerId, songs) {
  var container = document.getElementById(containerId);
  songs.map(function(song) {
    container.appendChild(renderSong(song));
  });
}
function findSongsInPlaylist(playlist) {
  var songs = window.MUSIC_DATA.songs.filter(function(song) {
    return playlist.songs.indexOf(song.id) != -1;
  });
  return songs;
}
function renderPlaylist(playlist) {
  var playlistItem = document.createElement('li');
  playlistItem.className = 'playlist-item';
  var playlistCover = document.createElement('div');
  playlistCover.className = 'playlist-cover';
  var playlistTitle = document.createElement('p');
  playlistTitle.className = 'playlist-title';
  var show = document.createElement('span');
  show.className = 'glyphicon glyphicon-chevron-right';
  show.setAttribute('id', playlist.id);
  show.setAttribute('data', 'closed');
  show.onclick = openPlaylistSongs;
  playlistTitle.appendChild(document.createTextNode(playlist.name));
  playlistTitle.appendChild(show);
  playlistItem.appendChild(playlistCover);
  playlistItem.appendChild(playlistTitle);
  var songsInPlaylist = document.createElement('ul');
  songsInPlaylist.className = 'playlist-item__ul';
  songsInPlaylist.setAttribute('id', 'songs-in-playlist-ul' + playlist.id);
  playlistItem.appendChild(songsInPlaylist);
  return playlistItem;
}
function renderPlaylists(containerId, playlists) {
  var container = document.getElementById(containerId);
  playlists.map(function(playlist) {
    container.appendChild(renderPlaylist(playlist));
    renderSongs('songs-in-playlist-ul' + playlist.id, Array.prototype.slice.call(findSongsInPlaylist(playlist), 0));
  });
}
/* Sorting function - in HTML pass the class name of p element that contains either artist name or song title */
function sortBy(filterOpt) {
  if(filterOpt == 'song-title') {
    document.getElementById('sort-by-artist').className = 'btn btn-info';
    document.getElementById('sort-by-title').className = 'btn btn-info sort-button--active';
  }
  else {
    document.getElementById('sort-by-artist').className = 'btn btn-info sort-button--active';
    document.getElementById('sort-by-title').className = 'btn btn-info';
  }
  var songParent = document.getElementById('songs-container-ul');
  var songs = songParent.getElementsByClassName('song-item');
  songs = Array.prototype.slice.call(songs, 0);
  var uSongs = [];
  songs.forEach(function(song) {
    uSongs.push(songParent.removeChild(song));
  });
  uSongs.sort(function(a, b) {
    if(a.getElementsByClassName(filterOpt)[0].innerHTML.replace('The ', '') < b.getElementsByClassName(filterOpt)[0].innerHTML.replace('The ', '')) {
      return -1;
    }
    else if(a.getElementsByClassName(filterOpt)[0].innerHTML.replace('The ', '') > b.getElementsByClassName(filterOpt)[0].innerHTML.replace('The ', '')) {
      return 1;
    }
    else {
      return 0;
    }
  });
  uSongs.forEach(function(song) {
    songParent.appendChild(song);
  });
}
/* Search function */
function search() {
  var input = document.getElementById('search-input').value;
  var songResults = [];
  var playlistsResults = [];
  if(input != '') {
    var regex = new RegExp(input, 'i');
    var searchParent = document.getElementById('search-container-ul');
    var searchSongs = searchParent.getElementsByClassName('song-item');
    searchSongs = Array.prototype.slice.call(searchSongs, 0);
    searchSongs.forEach(function(song) {
      searchParent.removeChild(song);
    });
    var searchPlaylists = searchParent.getElementsByClassName('playlist-item');
    searchPlaylists = Array.prototype.slice.call(searchPlaylists, 0);
    searchPlaylists.forEach(function(playlist) {
      searchParent.removeChild(playlist);
    });
    songResults = window.MUSIC_DATA.songs.filter(function(song) {
      return regex.test(song.title) || regex.test(song.artist);
    });
    playlistsResults = window.MUSIC_DATA.playlists.filter(function(playlist) {
      return regex.test(playlist.name);
    });
    renderPlaylists('search-container-ul', playlistsResults);
    renderSongs('search-container-ul', songResults);
  }
  else {
    songResults = [];
    playlistsResults = [];
    var searchParent = document.getElementById('search-container-ul');
    var searchSongs = searchParent.getElementsByClassName('song-item');
    searchSongs = Array.prototype.slice.call(searchSongs, 0);
    searchSongs.forEach(function(song) {
      searchParent.removeChild(song);
    });
    var searchPlaylists = searchParent.getElementsByClassName('playlist-item');
    searchPlaylists = Array.prototype.slice.call(searchPlaylists, 0);
    searchPlaylists.forEach(function(playlist) {
      searchParent.removeChild(playlist);
    });
  }
}

/* Add song to playlist */
function addToPlaylist(event) {
  window.SELECTED_SONG = event.target.getAttribute('id');
  document.getElementsByClassName('modal-container')[0].style.display = 'block';
  renderPlaylistsInModal();
}

/* Playlists in modal */
function renderPlaylistsInModal() {
  var modal = document.getElementById('modal');
  var modalItems = modal.getElementsByClassName('modal__items')[0];
  var itemsToDelete = modalItems.getElementsByClassName('modal-playlist-title');
  itemsToDelete = Array.prototype.slice.call(itemsToDelete, 0);
  itemsToDelete.map(function(item) {
    modalItems.removeChild(item);
  });
  window.MUSIC_DATA.playlists.map(function(playlist) {
    var playlistTitle = document.createElement('p');
    playlistTitle.className = 'modal-playlist-title';
    playlistTitle.appendChild(document.createTextNode(playlist.name));
    playlistTitle.setAttribute('id', playlist.id);
    playlistTitle.onclick = selectPlaylist;
    modalItems.appendChild(playlistTitle);
  });
}
document.getElementsByClassName('modal-container')[0].onclick = modalClose;
document.getElementsByClassName('modal__items')[0].onclick = function(e) {
  e.stopPropagation();
}
function modalClose() {
  document.getElementsByClassName('modal-container')[0].style.display = 'none';
  window.SELECTED_SONG = null;
}
function openPlaylistSongs(event) {
  var id = event.target.getAttribute('id');
  var ul = document.getElementById('songs-in-playlist-ul' + id);
  if($(event.target).parent().parent().parent().parent().attr('id') == "search-container") {
    $('#search-container').removeClass('main-container__tab--active');
    $('#playlists-container').addClass('main-container__tab--active');
    $('#tab-switch--search').parent().removeClass('tab-switch--active');
    $('#tab-switch--playlists').parent().addClass('tab-switch--active');
  }
  if(event.target.getAttribute('data') == 'closed') {
    ul.style.display = 'block';
    event.target.setAttribute('data', 'opened');
  }
  else {
    ul.style.display = 'none';
    event.target.setAttribute('data', 'closed');
  }
}
$('#add-playlist-button').click(function(e) {
  $('.add-playlist-container').css('display', 'block');
});
$('.add-playlist-container').click(function() {
  $('.add-playlist-container').css('display', 'none');
  $('#add-playlist-form  input').val('');
});
$('#add-playlist-form').click(function(e) {
  e.stopPropagation();
});
$('#add-playlist-form').on('submit', function(e) {
  e.preventDefault();
  var playlist = {
    id: window.MUSIC_DATA.playlists[window.MUSIC_DATA.playlists.length-1].id + 1,
    name: $('#playlist-name').val(),
    songs: []
  }
  playlist = JSON.stringify(playlist);
  $.post('/api/playlists', playlist, function(data) {
    if(data == 'Added playlist!') {
      $('.add-playlist-container').css('display', 'none');
      $('#add-playlist-form  input').val('');
      var addedPlaylist = JSON.parse(playlist);
      addedPlaylist = renderPlaylist(addedPlaylist);
      $('#playlists-container-ul').append($(addedPlaylist));
    }
  });
});
