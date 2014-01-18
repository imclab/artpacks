// Generated by CoffeeScript 1.6.3
(function() {
  var aps, createArtPacks, urls;

  createArtPacks = require('./');

  urls = ['https://dl.dropboxusercontent.com/u/258156216/artpacks/ProgrammerArt-2.1-dev-ResourcePack-20140116.zip', 'invalid.zip', 'README.md'];

  aps = createArtPacks(urls);

  aps.on('loadedURL', function(url) {
    return console.log('Loaded ', url);
  });

  aps.on('loadedAll', function(packs) {
    var audio, img, name, url, _i, _j, _len, _len1, _ref, _ref1, _results;
    console.log(aps);
    _ref = ['dirt', 'blocks/dirt', 'i/stick', 'items/stick', 'minecraft:dirt', 'somethingelse:dirt', 'invalid'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      document.body.appendChild(document.createTextNode(name + ' = '));
      url = aps.getTexture(name);
      if (url == null) {
        document.body.appendChild(document.createTextNode('(not found)'));
      } else {
        img = document.createElement('img');
        img.src = url;
        img.title = name;
        document.body.appendChild(img);
      }
      document.body.appendChild(document.createElement('br'));
    }
    _ref1 = ['liquid/splash'];
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      name = _ref1[_j];
      document.body.appendChild(document.createTextNode('sound: ' + name + ' = '));
      url = aps.getSound(name);
      if (url == null) {
        document.body.appendChild(document.createTextNode('(not found)'));
      } else {
        console.log(url);
        audio = document.createElement('audio');
        audio.src = url;
        audio.controls = true;
        audio.title = name;
        document.body.appendChild(audio);
      }
      _results.push(document.body.appendChild(document.createElement('br')));
    }
    return _results;
  });

}).call(this);
