var chai = require('chai')
var expect = chai.expect
var fLoader = require('../fLoader');
var path = require('path');

describe('Text Files Loader', function () {

  describe('Setup', function () {

    it('should have default options', function (done) {
      var expectedDefaults = {
        keysAsFullPath: false,
        flatten: true,
        recursive: true,
        matchRegExp: null
      }

      expect(fLoader.config).to.eql(expectedDefaults)
      done()
    })


    it('should throw an error if an invalid option is passed', function (done) {

      var options = {
        invalidOption: true
      }

      function shouldThrow() {
        fLoader.setup(options)
      }

      expect(shouldThrow).to.throw('Invalid option "invalidOption"')
      done()
    })
  })

  describe('Files loading', function () {

    it('should throw an error if a directory path is not given', function (done) {

      function shouldThrow() {
        fLoader.load()
      }

      expect(shouldThrow).to.throw('Cannot load text files: Invalid directory')
      done()
    })

    it('should throw an error if no callback is given', function (done) {

      function shouldThrow() {
        fLoader.load('any')
      }

      expect(shouldThrow).to.throw('Cannot load text files: Invalid callback')
      done()
    })

    it('should index text files content of a directory - no recursive', function (done) {
      var options = {
        recursive: false
      }
      var testDir = path.join(__dirname, 'simpleIndex')
      var expectedFiles = {
        firstFile: 'first file content',
        secondFile: 'second file content',
        thirdFile: 'third file content'
      }

      fLoader.setup(options)
      fLoader.load(testDir, function onLoaded(err, files) {
        expect(files).to.eql(expectedFiles)
        done()
      })
    })


    describe('flatten option with recursive indexing', function () {

      it('when enabled - should result in a simple object where keys are the file names', function (done) {
        var options = {
          recursive: true,
          flatten: true
        }
        var testDir = path.join(__dirname, 'recursiveIndex')
        var expectedFiles = {
          rootText: 'root',
          level1Text: 'level1',
          level2Text: 'level2'
        }

        fLoader.setup(options)
        fLoader.load(testDir, function onLoaded(err, files) {
          expect(files).to.eql(expectedFiles)
          done()
        })
      })

      it('when disabled - should result in a deep object where keys are the split path of the files', function (done) {
        var options = {
          recursive: true,
          flatten: false
        }
        var testDir = path.join(__dirname, 'recursiveIndex')
        var expectedFiles = {
          rootText: 'root',
          level1 : {
            level1Text: 'level1',
            level2: {
              level2Text: 'level2'
            }
          }
        }

        fLoader.setup(options)
        fLoader.load(testDir, function onLoaded(err, files) {
          expect(files).to.eql(expectedFiles)
          done()
        })
      })
    })

    describe('the filtering', function () {

      it('should only load the files that match the filter', function (done) {
        var options = {
          matchRegExp: /\.sql/
        }
        var testDir = path.join(__dirname, 'withFilter')
        var expectedFiles = {
          query: 'SELECT * FROM example;'
        }

        fLoader.setup(options)
        fLoader.load(testDir, function onLoaded(err, files) {
          expect(files).to.eql(expectedFiles)
          done()
        })
      })
    })
  })

  describe('synchronous file loading', function () {

    it('should load files synchronously', function (done) {

      var files
      var options = {
        matchRegExp: null,
        flatten: true,
        recursive: false
      }
      var testDir = path.join(__dirname, 'simpleIndex')
      var expectedFiles = {
        firstFile: 'first file content',
        secondFile: 'second file content',
        thirdFile: 'third file content'
      }

      fLoader.setup(options)
      files = fLoader.loadSync(testDir)

      expect(files).to.eql(expectedFiles)
      done()
    })

    it('should allow to load files recursively from subdirectories', function (done) {

      var files
      var options = {
        matchRegExp: null,
        flatten: true,
        recursive: true
      }
      var testDir = path.join(__dirname, 'recursiveIndex')
      var expectedFiles = {
        rootText: 'root',
        level1Text: 'level1',
        level2Text: 'level2'
      }

      fLoader.setup(options)
      files = fLoader.loadSync(testDir)

      expect(files).to.eql(expectedFiles)
      done()
    })

    it('should allow to filter the files', function (done) {
      var files
      var options = {
        matchRegExp: /\.sql/,
        flatten: true,
        recursive: false
      }
      var testDir = path.join(__dirname, 'withFilter')
      var expectedFiles = {
        query: 'SELECT * FROM example;'
      }

      fLoader.setup(options)
      files = fLoader.loadSync(testDir)
      expect(files).to.eql(expectedFiles)
      done()
    })
  })
})
