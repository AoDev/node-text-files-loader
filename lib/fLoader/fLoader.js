
var extend = require('extend-object')
var filewalker = require('filewalker')
var async = require('async')
var fs = require('fs')
var path = require('path')
var indexedFilesContent = {}

var defaultOptions = {
  keysAsFullPath: false,
  checkForDuplicateKey: false,
  deep: false
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


function indexFileContent(fullPath, qNext) {

  var key = module.exports.config.keysAsFullPath ?
    fullPath : path.basename(fullPath, path.extname(fullPath))

  fs.readFile(fullPath, 'utf8', function (err, data) {
    if (err) {
      return qNext(err)
    }
    indexedFilesContent[key] = data
    qNext()
  })
}


/**
 * Use an asynchronous queue to handle the songs data process
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
    q.push(fullPath)
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

  filewalker(dir)
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
