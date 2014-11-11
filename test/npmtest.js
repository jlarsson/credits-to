var assert = require('assert');
var should = require('should');
var fspath = require('path');
var creditsto = require('../');
var _ = require('lodash');

describe("credits-to (npm)", function(done) {

  var fakeFileSystem = {
    'package.json': {
      name: 'App',
      dependencies: {
        'fixer': '^1.0.0',
        'doer': '*',
        'MISSING': '1.0.0' // this will be omitted in output
      },
      devDependencies: {
        'tester': '^9.0.0'
      }
    },
    'node_modules/tester/package.json': {
      name: 'tester',
      description: 'nodejs testing',
      version: '9.1.1',
      author: 'Brave Star',
      licenses: { // license as object
        type: 'MIT',
        url: 'www.example.com'
      },
      repository: { // repo as object
        type: 'git',
        url: 'git@github.com:bravestar/tester' // this will be translated to https://github.com/bravestar/tester
      }
    },
    'node_modules/fixer/package.json': {
      name: 'fixer',
      description: 'nodejs fixer of things',
      version: '1.0.0',
      repository: 'git://github.com/handy/man.git',
      dependencies: {
        'doer': '1.2.3'
      },
      peerDependencies: {
        'peerie': '^1.1.0'
      },
      license: 'ICS'
    },
    'node_modules/fixer/node_modules/doer/package.json': {
      name: 'doer',
      description: 'nodejs doer of stuff',
      version: '1.2.3',
      license: 'BSD2'
    },
    'node_modules/doer/package.json': {
      name: 'doer',
      description: 'nodejs doer of stuff',
      version: '1.3.0',
      license: 'BSD'
    },
    'node_modules/peerie/package.json': {
      name: 'peerie',
      version: '1.5.0',
      license: 'MIT'
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
    assert(subject.npm.App);
  });
  it('finds dependencies', function() {
    assert(subject.npm.doer);
    assert(subject.npm.fixer);
  });
  it('finds dev dependencies', function() {
    assert(subject.npm.tester);
  });
  it('finds peer dependencies', function() {
    assert(subject.npm.peerie);
  });
  it('finds only existing dependencies', function() {
    _(subject.npm).keys().sort().value().should.eql(['App', 'doer', 'fixer', 'peerie', 'tester']);
  });
  it('omits listed but missing dependencies', function() {
    assert(!subject.npm.MISSING, 'which was referenced from App');
  })

  it('extracts names', function() {
    'App'.should.equal(subject.npm.App.name);
    'tester'.should.equal(subject.npm.tester.name);
    'doer'.should.equal(subject.npm.doer.name);
    'fixer'.should.equal(subject.npm.fixer.name);
  });
  it('extracts descriptions', function() {
    ''.should.equal(subject.npm.App.description);
    'nodejs testing'.should.equal(subject.npm.tester.description);
  });
  it('extracts licenses', function() {
    [].should.eql(subject.npm.App.licenses);
    ['BSD', 'BSD2'].should.eql(subject.npm.doer.licenses, '2 versions, different licenses');
    ['ICS'].should.eql(subject.npm.fixer.licenses);
  });
  it('extracts versions', function() {
    [].should.eql(subject.npm.App.versions);
    ['1.2.3', '1.3.0'].should.eql(subject.npm.doer.versions, '2 versions');
    ['1.0.0'].should.eql(subject.npm.fixer.versions);
  });
  it('extracts repositories', function() {
    [].should.eql(subject.npm.App.repositories);
    ['https://github.com/bravestar/tester'].should.eql(subject.npm.tester.repositories);
    ['https://github.com/handy/man'].should.eql(subject.npm.fixer.repositories);
  });
});
