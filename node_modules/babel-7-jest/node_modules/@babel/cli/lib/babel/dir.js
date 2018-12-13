"use strict";

exports.__esModule = true;
exports.default = _default;

var _defaults = _interopRequireDefault(require("lodash/defaults"));

var _outputFileSync = _interopRequireDefault(require("output-file-sync"));

var _slash = _interopRequireDefault(require("slash"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var util = _interopRequireWildcard(require("./util"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(commander, filenames, opts) {
  function write(src, relative, base) {
    if (!util.isCompilableExtension(relative, commander.extensions)) {
      return false;
    }

    relative = util.adjustRelative(relative, commander.keepFileExtension);
    var dest = getDest(commander, relative, base);
    var data = util.compile(src, (0, _defaults.default)({
      sourceFileName: (0, _slash.default)(_path.default.relative(dest + "/..", src)),
      sourceMapTarget: _path.default.basename(relative)
    }, opts));
    if (!data) return false;

    if (data.map && commander.sourceMaps && commander.sourceMaps !== "inline") {
      var mapLoc = dest + ".map";
      data.code = util.addSourceMappingUrl(data.code, mapLoc);
      (0, _outputFileSync.default)(mapLoc, JSON.stringify(data.map));
    }

    (0, _outputFileSync.default)(dest, data.code);
    util.chmod(src, dest);
    util.log(src + " -> " + dest);
    return true;
  }

  function getDest(commander, filename, base) {
    if (commander.relative) return _path.default.join(base, commander.outDir, filename);
    return _path.default.join(commander.outDir, filename);
  }

  function handleFile(src, filename, base) {
    var didWrite = write(src, filename, base);

    if (!didWrite && commander.copyFiles) {
      var dest = getDest(commander, filename, base);
      (0, _outputFileSync.default)(dest, _fs.default.readFileSync(src));
      util.chmod(src, dest);
    }
  }

  function handle(filename) {
    if (!_fs.default.existsSync(filename)) return;

    var stat = _fs.default.statSync(filename);

    if (stat.isDirectory(filename)) {
      var dirname = filename;

      if (commander.deleteDirOnStart) {
        util.deleteDir(commander.outDir);
      }

      util.readdir(dirname, commander.includeDotfiles).forEach(function (filename) {
        var src = _path.default.join(dirname, filename);

        handleFile(src, filename, dirname);
      });
    } else {
      write(filename, _path.default.basename(filename), _path.default.dirname(filename));
    }
  }

  if (!commander.skipInitialBuild) {
    filenames.forEach(handle);
  }

  if (commander.watch) {
    var chokidar = util.requireChokidar();
    filenames.forEach(function (dirname) {
      var watcher = chokidar.watch(dirname, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 50,
          pollInterval: 10
        }
      });
      ["add", "change"].forEach(function (type) {
        watcher.on(type, function (filename) {
          var relative = _path.default.relative(dirname, filename) || filename;

          try {
            handleFile(filename, relative);
          } catch (err) {
            console.error(err.stack);
          }
        });
      });
    });
  }
}