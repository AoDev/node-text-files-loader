
var extend = require('extend-object')
var filewalker = require('filewalker')
var async = require('async')
var fs = require('fs')
var path = require('path')
var indexedFilesContent = {}

var defaultOptions = {
  keysAsFullPath: false,
  flatten: true,
  recursive: true
}


function setup(options) {
  var key
  var config = extend({}, defaultOptions)

  for (key in options) {
    if (config.hasOwnProperty(key)) {
      config[key] = options[key]
    }
    else {
      throw new Error('Invalid option "' + key + '"')
    }
  }

  module.exports.config = config
}

function filenameWithoutExt(filename) {
  return path.basename(filename, path.extname(filename))
}

function indexFileContent(fileDetails, qNext) {

  var config = module.exports.config

  var key = config.keysAsFullPath ?
    fileDetails.fullPath : filenameWithoutExt(fileDetails.fullPath)

  fs.readFile(fileDetails.fullPath, 'utf8', function (err, data) {

    var level;
    var splitPath;

    if (err) {
      return qNext(err)
    }

    if (config.flatten === true) {
      indexedFilesContent[key] = data
    }

    if (config.flatten === false) {
      splitPath = path.relative(fileDetails.dir, fileDetails.fullPath).split(path.sep);
      level = indexedFilesContent;
      if (splitPath.length > 1) {
        for (var i = 0; i < splitPath.length - 1; i++) {
          if (!level.hasOwnProperty(splitPath[i])) {
            level[splitPath[i]] = {}
          }
          level = level[splitPath[i]]
        }
      }
      level[key] = data

    }


    qNext()
  })
}


/**
 * Use an asynchronous queue to read the files
 * @type {async.queue}
 * @see  https://github.com/caolan/async#queue
 */
var q = async.queue(indexFileContent, 1)



function load(dir, onLoaded) {

  var config = module.exports.config

  if (typeof dir !== 'string') {
    throw new Error('Cannot load text files: Invalid directory')
  }

  if (typeof onLoaded !== 'function') {
    throw new Error('Cannot load text files: Invalid callback')
  }

  function addToQueue(p, s, fullPath) {
    q.push({
      fullPath: fullPath,
      dir: dir
    })
  }

  function handleError(err) {
    onLoaded(err)
  }

  function onAllFilesFound() {
    q.drain = function () {
      onLoaded(null, indexedFilesContent)
    }
  }

  indexedFilesContent = {}

  filewalker(dir, { recursive: config.recursive })
    .on('file', addToQueue)
    .on('error', handleError)
    .on('done', onAllFilesFound)
    .walk()

}


module.exports = {
  setup: setup,
  config: extend({}, defaultOptions),
  load: load
}
