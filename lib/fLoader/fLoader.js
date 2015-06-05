/**
 * @module fLoader
 */

var extend = require('extend-object')
var filewalker = require('filewalker')
var async = require('async')
var fs = require('fs')
var path = require('path')
var fsTraverse = require('fs-traverse')
var indexedFilesContent = {}

var defaultOptions = {
  keysAsFullPath: false,
  flatten: true,
  recursive: true,
  matchRegExp: null
}


/**
 * Configure text-files-loader
 * @param  {Object} options check defaultOptions
 * @return {[type]}         [description]
 */
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


/**
 * extract filename without its extension
 * @param  {[type]} filename [description]
 * @return {[type]}          [description]
 */
function filenameWithoutExt(filename) {
  return path.basename(filename, path.extname(filename))
}


/**
 * Add a file and its content to the index
 * @param  {Object} fileDetails [description]
 * @param  {Funciton} qNext       async.queue callback
 * @return {[type]}             [description]
 */
function indexFileContent(fileDetails, qNext) {

  var config = module.exports.config

  var key = config.keysAsFullPath ?
    fileDetails.fullPath : filenameWithoutExt(fileDetails.fullPath)

  fs.readFile(fileDetails.fullPath, 'utf8', function (err, data) {

    var level
    var splitPath

    if (err) {
      return qNext(err)
    }

    if (config.flatten === true) {
      indexedFilesContent[key] = data
    }

    if (config.flatten === false) {
      splitPath = path.relative(fileDetails.dir, fileDetails.fullPath).split(path.sep)
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


/**
 * Read text files content from a directory, indexed into an object
 * @param  {[type]} dir      [description]
 * @param  {[type]} onLoaded [description]
 * @return {[type]}          [description]
 */
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

  filewalker(dir, { recursive: config.recursive, matchRegExp: config.matchRegExp })
    .on('file', addToQueue)
    .on('error', handleError)
    .on('done', onAllFilesFound)
    .walk()

}


function indexFileContentSync(index, fileDetails) {
  var config = module.exports.config
  var level
  var splitPath
  var key = config.keysAsFullPath ?
    fileDetails.fullPath : filenameWithoutExt(fileDetails.fullPath)

  if (config.flatten === true) {
    indexedFilesContent[key] = fs.readFileSync(fileDetails.fullPath, 'utf8')
  }
  else {
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
}

function loadSync(dir) {

  var config = module.exports.config
  var key = ''
  var files

  if (typeof dir !== 'string') {
    throw new Error('Cannot load text files: Invalid directory')
  }

  indexedFilesContent = {}

  if (config.recursive === true) {
    fsTraverse.eachFileSync(dir, function onFile(err, filepath, stat) {

      if (err) {
        throw new Error(err)
      }

      if (!stat.isDirectory() ) {
        indexFileContentSync(indexedFilesContent, {
          dir: dir, fullPath: filepath
        })
      }
    })
  }
  else {
    files = fs.readdirSync(dir)

    files.forEach(function (file, index) {
      var filepath = path.join(dir, file)
      var stats = fs.statSync(filepath)

      if (!stats.isDirectory()) {
        indexFileContentSync(indexedFilesContent, {
          dir: dir, fullPath: filepath
        })
      }
    })
  }

  return indexedFilesContent
}


// Interface
module.exports = {
  setup: setup,
  config: extend({}, defaultOptions),
  load: load,
  loadSync: loadSync
}
