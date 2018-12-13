"use strict";

exports.__esModule = true;
exports.chmod = chmod;
exports.readdir = readdir;
exports.readdirForCompilable = readdirForCompilable;
exports.isCompilableExtension = isCompilableExtension;
exports.addSourceMappingUrl = addSourceMappingUrl;
exports.log = log;
exports.transform = transform;
exports.compile = compile;
exports.deleteDir = deleteDir;
exports.requireChokidar = requireChokidar;
exports.adjustRelative = adjustRelative;

var _commander = _interopRequireDefault(require("commander"));

var _fsReaddirRecursive = _interopRequireDefault(require("fs-readdir-recursive"));

var babel = _interopRequireWildcard(require("@babel/core"));

var _includes = _interopRequireDefault(require("lodash/includes"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function chmod(src, dest) {
  _fs.default.chmodSync(dest, _fs.default.statSync(src).mode);
}

function readdir(dirname, includeDotfiles, filter) {
  return (0, _fsReaddirRecursive.default)(dirname, function (filename) {
    return (includeDotfiles || filename[0] !== ".") && (!filter || filter(filename));
  });
}

function readdirForCompilable(dirname, includeDotfiles) {
  return readdir(dirname, includeDotfiles, isCompilableExtension);
}

function isCompilableExtension(filename, altExts) {
  var exts = altExts || babel.DEFAULT_EXTENSIONS;

  var ext = _path.default.extname(filename);

  return (0, _includes.default)(exts, ext);
}

function addSourceMappingUrl(code, loc) {
  return code + "\n//# sourceMappingURL=" + _path.default.basename(loc);
}

function log(msg) {
  if (!_commander.default.quiet) console.log(msg);
}

function transform(filename, code, opts) {
  opts = Object.assign({}, opts, {
    filename: filename
  });
  return babel.transform(code, opts);
}

function compile(filename, opts) {
  try {
    return babel.transformFileSync(filename, opts);
  } catch (err) {
    if (_commander.default.watch) {
      console.error(err);
      return {
        ignored: true
      };
    } else {
      throw err;
    }
  }
}

function deleteDir(path) {
  if (_fs.default.existsSync(path)) {
    _fs.default.readdirSync(path).forEach(function (file) {
      var curPath = path + "/" + file;

      if (_fs.default.lstatSync(curPath).isDirectory()) {
        deleteDir(curPath);
      } else {
        _fs.default.unlinkSync(curPath);
      }
    });

    _fs.default.rmdirSync(path);
  }
}

process.on("uncaughtException", function (err) {
  console.error(err);
  process.exit(1);
});

function requireChokidar() {
  try {
    return require("chokidar");
  } catch (err) {
    console.error("The optional dependency chokidar failed to install and is required for " + "--watch. Chokidar is likely not supported on your platform.");
    throw err;
  }
}

function adjustRelative(relative, keepFileExtension) {
  if (keepFileExtension) {
    return relative;
  }

  return relative.replace(/\.(\w*?)$/, "") + ".js";
}