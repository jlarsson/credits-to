var rewire = require('rewire');
var fsmock = require('fs-mock');
var assert = require('assert');
var creditsto = require('../');
var fspath = require('path');

describe("credits-to", function () {

    function makeTest() {
        return {
            _files: {},
            mockFile: function (path, contents) {
                this._files[fspath.resolve('.', path)] = JSON.stringify(contents);
                return this;
            },
            test: function (expected, done) {
                creditsto({
                    mockReadFile: function (path, cb) {
                        var contents = this._files[path];
                        if (contents) {
                            return cb(null, contents);
                        }
                        return cb(new Error('Mock file not found: ' + path));

                    }.bind(this),
                    bower: false
                }, function (err, actual) {
                    assert(!err);
                    assert.deepEqual(expected, actual);
                    done();
                });
            }
        };
    }

    it("parses basic package information", function (done) {
        makeTest()
            .mockFile('package.json', {
                name: 'test',
                version: '0.0.1',
                license: 'MIT',
                description: 'test package',
                repository: 'a'

            })
            .test({
                npm: {
                    'test': {
                        name: 'test',
                        description: 'test package',
                        versions: ['0.0.1'],
                        licenses: ['MIT'],
                        repositories: ['a']
                    }
                }
            }, done);
    });

    it("do not follow uninstalled packages", function (done) {
        makeTest()
            .mockFile('package.json', {
                name: 'test',
                version: '0.0.1',
                license: 'MIT',
                description: 'test package',
                repository: 'a',
                dependecies: {
                    'dep': '1.0.0'
                }

            })
            .test({
                npm: {
                    'test': {
                        name: 'test',
                        description: 'test package',
                        versions: ['0.0.1'],
                        licenses: ['MIT'],
                        repositories: ['a']
                    }
                }
            }, done);
    });

    it("follows installed packages", function (done) {
        makeTest()
            .mockFile('package.json', {
                name: 'test',
                version: '0.0.1',
                license: 'MIT',
                description: 'test package',
                repository: 'test repo',
                dependencies: {
                    'a': '1.0.0'
                }

            })
            .mockFile('node_modules/a/package.json', {
                name: 'a',
                version: '1.0.0',
                license: 'BSD',
                description: 'a package',
                repository: 'a repo',
                dependencies: {
                    b: '2.0.0'
                }
            })
            .mockFile('node_modules/a/node_modules/b/package.json', {
                name: 'b',
                version: '2.0.0',
                license: {type: 'b-lic'},
                description: 'b package',
                repository: 'b repo'
            })
            .test({
                npm: {
                    'test': {
                        name: 'test',
                        description: 'test package',
                        versions: ['0.0.1'],
                        licenses: ['MIT'],
                        repositories: ['test repo']
                    },
                    'a': {
                        name: 'a',
                        description: 'a package',
                        versions: ['1.0.0'],
                        licenses: ['BSD'],
                        repositories: ['a repo']
                    },
                    'b': {
                        name: 'b',
                        description: 'b package',
                        versions: ['2.0.0'],
                        licenses: ['b-lic'],
                        repositories: ['b repo']
                    }
                }
            }, done);
    });

});