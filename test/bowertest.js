var assert = require('assert');
var should = require('should');
var fspath = require('path');
var creditsto = require('../');
var _ = require('lodash');

describe("credits-to (bower)", function(done) {

  var fakeFileSystem = {
    'bower.json': {
      name: 'app.js',
      "license": "MIT",
      dependencies: {
        "bootstrap": "~3.3.0",
        "jquery": "~2.1.1",
      },
    },
    'bower_components/bootstrap/.bower.json': {
      "name": "bootstrap",
      "description": "The most popular front-end framework for developing responsive, mobile first projects on the web.",
      "version": "3.3.0",
      "_source": "git://github.com/twbs/bootstrap.git",
    },
    'bower_components/jquery/.bower.json': {
      "name": "jquery",
      "version": "2.1.1",
      "license": "MIT",
      "_source": "git://github.com/jquery/jquery.git",
    }
  };

  // fake readFile implementation for test
  var cwd = fspath.resolve('.');

  function mockReadFile(path, cb) {
    if (path.indexOf(cwd) === 0) {
      var relative = path.substring(cwd.length + 1);
      var packageObject = fakeFileSystem[relative];
      if (packageObject) {
        return cb(null, JSON.stringify(packageObject));
      }
    }
    return cb(new Error('File not found:' + path));
  }

  var subject;
  beforeEach(function(done) {
    creditsto({
        mockReadFile: mockReadFile
      },
      function(err, c) {
        subject = c;
        //console.log(JSON.stringify(c, null, 2));
        done(err);
      });
  });
  it('finds own module', function() {
    assert(subject.bower['app.js']);
  });
  it('finds dependencies', function() {
    assert(subject.bower.jquery);
    assert(subject.bower.bootstrap);
  });
  it('extracts names', function() {
    'app.js'.should.equal(subject.bower['app.js'].name);
    'jquery'.should.equal(subject.bower.jquery.name);
    'bootstrap'.should.equal(subject.bower.bootstrap.name);
  });
  it('extracts licenses', function() {
    ['MIT'].should.eql(subject.bower.jquery.licenses);
    [].should.eql(subject.bower.bootstrap.licenses);
  });

  it('extracts versions', function() {
    ['3.3.0'].should.eql(subject.bower.bootstrap.versions);
    ['2.1.1'].should.eql(subject.bower.jquery.versions);
  });
  it('extracts repositories', function() {
    ['https://github.com/jquery/jquery'].should.eql(subject.bower.jquery.repositories);
    ['https://github.com/twbs/bootstrap'].should.eql(subject.bower.bootstrap.repositories);
  });
});
