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
    var audio, container, dragleave, dragover, drop, img, name, url, _i, _j, _len, _len1, _ref, _ref1;
    container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.height = '90%';
    container.style.width = '90%';
    container.style.border = '5px dotted black';
    document.body.appendChild(container);
    console.log(aps);
    _ref = ['dirt', 'blocks/dirt', 'i/stick', 'items/stick', 'minecraft:dirt', 'somethingelse:dirt', 'invalid'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      container.appendChild(document.createTextNode(name + ' = '));
      url = aps.getTexture(name);
      if (url == null) {
        container.appendChild(document.createTextNode('(not found)'));
      } else {
        img = document.createElement('img');
        img.src = url;
        img.title = name;
        container.appendChild(img);
      }
      container.appendChild(document.createElement('br'));
    }
    _ref1 = ['liquid/splash'];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      name = _ref1[_j];
      container.appendChild(document.createTextNode('sound: ' + name + ' = '));
      url = aps.getSound(name);
      if (url == null) {
        container.appendChild(document.createTextNode('(not found)'));
      } else {
        console.log(url);
        audio = document.createElement('audio');
        audio.src = url;
        audio.controls = true;
        audio.title = name;
        container.appendChild(audio);
      }
      container.appendChild(document.createElement('br'));
    }
    dragover = function() {
      return container.style.border = '5px dashed black';
    };
    dragleave = function() {
      return container.style.border = '5px dotted black';
    };
    drop = function(ev) {
      var files;
      ev.stopPropagation();
      ev.preventDefault();
      files = ev.target.files || ev.dataTransfer.files;
      console.log(files);
      return window.alert(files);
    };
    container.addEventListener('dragover', dragover, false);
    container.addEventListener('dragleave', dragleave, false);
    return container.addEventListener('drop', drop, false);
  });

}).call(this);
