var chai = require('chai')
var expect = chai.expect
var fLoader = require('../fLoader');
var path = require('path');

describe('Text Files Loader', function () {

  describe('Setup', function () {

    it('should have default options', function (done) {
      var expectedDefaults = {
        keysAsFullPath: false,
        checkForDuplicateKey: false,
        deep: false
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

    it('should find and index the content of text files of a directory', function (done) {
      var testDir = path.join(__dirname, 'simpleIndex')
      var expectedFiles = {
        firstFile: 'first\nfile\ncontent\n',
        secondFile: 'second\nfile\ncontent\n',
        thirdFile: 'third\nfile\ncontent\n'
      }

      fLoader.load(testDir, function onLoaded(err, files) {
        expect(files).to.eql(expectedFiles)
        done()
      })
    })


  })


})
