// Generated by CoffeeScript 1.6.3
(function() {
  var ArtPackArchive, ArtPacks, Buffer, EventEmitter, ZIP, binaryXHR, fs, path, splitNamespace,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ZIP = require('zip');

  path = require('path');

  fs = require('fs');

  binaryXHR = require('binary-xhr');

  EventEmitter = (require('events')).EventEmitter;

  Buffer = (require('native-buffer-browserify')).Buffer;

  ArtPacks = (function(_super) {
    __extends(ArtPacks, _super);

    function ArtPacks(packs) {
      var pack, _i, _len;
      this.packs = [];
      this.pending = {};
      this.blobURLs = {};
      this.setMaxListeners(0);
      for (_i = 0, _len = packs.length; _i < _len; _i++) {
        pack = packs[_i];
        this.addPack(pack);
      }
    }

    ArtPacks.prototype.addPack = function(x, name) {
      var pack, packIndex, rawZipArchiveData, url,
        _this = this;
      if (name == null) {
        name = void 0;
      }
      if (x instanceof ArrayBuffer) {
        rawZipArchiveData = x;
        this.packs.push(new ArtPackArchive(rawZipArchiveData, name != null ? name : "(" + rawZipArchiveData.byteLength + " raw bytes)"));
        this.emit('loadedRaw', rawZipArchiveData);
        return this.emit('loadedAll');
      } else if (typeof x === 'string') {
        url = x;
        this.pending[url] = true;
        packIndex = this.packs.length;
        this.packs[packIndex] = null;
        this.emit('loadingURL', url);
        return binaryXHR(url, function(err, packData) {
          var e;
          if (_this.packs[packIndex] !== null) {
            console.log("artpacks warning: index " + packIndex + " occupied, expected to be empty while loading " + url);
          }
          if (err || !packData) {
            console.log("artpack failed to load \#" + packIndex + " - " + url + ": " + err);
            _this.emit('failedURL', url, err);
            delete _this.pending[url];
            return;
          }
          try {
            _this.packs[packIndex] = new ArtPackArchive(packData, url);
          } catch (_error) {
            e = _error;
            console.log("artpack failed to parse \#" + packIndex + " - " + url + ": " + e);
            _this.emit('failedURL', url, e);
          }
          delete _this.pending[url];
          console.log('artpacks loaded pack:', url);
          _this.emit('loadedURL', url);
          if (Object.keys(_this.pending).length === 0) {
            return _this.emit('loadedAll');
          }
        });
      } else {
        pack = x;
        this.emit('loadedPack', pack);
        this.emit('loadedAll');
        return this.packs.push(pack);
      }
    };

    ArtPacks.prototype.getTextureImage = function(name, onload, onerror) {
      var img, load,
        _this = this;
      img = new Image();
      load = function() {
        var url;
        url = _this.getTexture(name);
        if (url == null) {
          return onerror("no such texture in artpacks: " + name, img);
        }
        img.src = url;
        img.onload = function() {
          return onload(img);
        };
        return img.onerror = function(err) {
          return onerror(err, img);
        };
      };
      if (this.isQuiescent()) {
        return load();
      } else {
        return this.on('loadedAll', load);
      }
    };

    ArtPacks.prototype.getTexture = function(name) {
      return this.getURL(name, 'textures');
    };

    ArtPacks.prototype.getSound = function(name) {
      return this.getURL(name, 'sounds');
    };

    ArtPacks.prototype.getURL = function(name, type) {
      var blob, url;
      url = this.blobURLs[type + ' ' + name];
      if (url != null) {
        return url;
      }
      blob = this.getBlob(name, type);
      if (blob == null) {
        return void 0;
      }
      url = URL.createObjectURL(blob);
      this.blobURLs[type + ' ' + name] = url;
      return url;
    };

    ArtPacks.prototype.getBlob = function(name, type) {
      var blob, pack, _i, _len, _ref;
      _ref = this.packs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pack = _ref[_i];
        if (!pack) {
          continue;
        }
        blob = pack.getBlob(name, type);
        if (blob != null) {
          return blob;
        }
      }
      return void 0;
    };

    ArtPacks.prototype.refresh = function() {
      var url, _i, _len, _ref;
      _ref = this.blobURLs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        url = _ref[_i];
        URL.revokeObjectURL(url);
      }
      return this.blobURLs = [];
    };

    ArtPacks.prototype.clear = function() {
      this.packs = [];
      return this.refresh();
    };

    ArtPacks.prototype.getLoadedPacks = function() {
      var pack, ret, _i, _len, _ref;
      ret = [];
      _ref = this.packs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pack = _ref[_i];
        if (pack != null) {
          ret.push(pack);
        }
      }
      return ret;
    };

    ArtPacks.prototype.isQuiescent = function() {
      return this.getLoadedPacks().length > 0 && Object.keys(this.pending).length === 0;
    };

    return ArtPacks;

  })(EventEmitter);

  splitNamespace = function(name) {
    var a, namespace;
    a = name.split(':');
    if (a.length > 1) {
      namespace = a[0], name = a[1];
    }
    if (namespace == null) {
      namespace = '*';
    }
    return [namespace, name];
  };

  ArtPackArchive = (function() {
    function ArtPackArchive(packData, name) {
      var _this = this;
      this.name = name != null ? name : void 0;
      if (packData instanceof ArrayBuffer) {
        packData = new Buffer(new Uint8Array(packData));
      }
      this.zip = new ZIP.Reader(packData);
      this.zipEntries = {};
      this.zip.forEach(function(entry) {
        return _this.zipEntries[entry.getName()] = entry;
      });
      this.namespaces = this.scanNamespaces();
      this.namespaces.push('foo');
    }

    ArtPackArchive.prototype.toString = function() {
      var _ref;
      return (_ref = this.name) != null ? _ref : 'ArtPack';
    };

    ArtPackArchive.prototype.scanNamespaces = function() {
      var namespaces, parts, zipEntryName, _i, _len, _ref;
      namespaces = {};
      _ref = Object.keys(this.zipEntries);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        zipEntryName = _ref[_i];
        parts = zipEntryName.split(path.sep);
        if (parts.length < 2) {
          continue;
        }
        if (parts[0] !== 'assets') {
          continue;
        }
        if (parts[1].length === 0) {
          continue;
        }
        namespaces[parts[1]] = true;
      }
      return Object.keys(namespaces);
    };

    ArtPackArchive.prototype.nameToPath = {
      textures: function(fullname) {
        var a, basename, category, namespace, partname, pathRP, _ref, _ref1;
        a = fullname.split('/');
        if (a.length > 1) {
          category = a[0], partname = a[1];
        }
        category = (_ref = {
          undefined: 'blocks',
          'i': 'items'
        }[category]) != null ? _ref : category;
        if (partname == null) {
          partname = fullname;
        }
        _ref1 = splitNamespace(partname), namespace = _ref1[0], basename = _ref1[1];
        pathRP = "assets/" + namespace + "/textures/" + category + "/" + basename + ".png";
        console.log('artpacks texture:', fullname, [category, namespace, basename]);
        return pathRP;
      },
      sounds: function(fullname) {
        var name, namespace, pathRP, _ref;
        _ref = splitNamespace(fullname), namespace = _ref[0], name = _ref[1];
        return pathRP = "assets/" + namespace + "/sounds/" + name + ".ogg";
      }
    };

    ArtPackArchive.prototype.mimeTypes = {
      textures: 'image/png',
      sounds: 'audio/ogg'
    };

    ArtPackArchive.prototype.getArrayBuffer = function(name, type) {
      var data, found, namespace, pathRP, tryPath, tryPaths, zipEntry, _i, _len;
      pathRP = this.nameToPath[type](name);
      found = false;
      if (pathRP.indexOf('*') === -1) {
        tryPaths = [pathRP];
      } else {
        tryPaths = (function() {
          var _i, _len, _ref, _results;
          _ref = this.namespaces;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            namespace = _ref[_i];
            _results.push(pathRP.replace('*', namespace));
          }
          return _results;
        }).call(this);
      }
      for (_i = 0, _len = tryPaths.length; _i < _len; _i++) {
        tryPath = tryPaths[_i];
        zipEntry = this.zipEntries[tryPath];
        if (zipEntry != null) {
          data = zipEntry.getData();
          return data;
        }
      }
      return void 0;
    };

    ArtPackArchive.prototype.getBlob = function(name, type) {
      var arrayBuffer;
      arrayBuffer = this.getArrayBuffer(name, type);
      if (arrayBuffer == null) {
        return void 0;
      }
      return new Blob([arrayBuffer], {
        type: this.mimeTypes[type]
      });
    };

    return ArtPackArchive;

  })();

  module.exports = function(opts) {
    return new ArtPacks(opts);
  };

}).call(this);
