(function(module) {
  'use strict';

  var fspath = require('path');
  var fs = require('fs');
  var async = require('async');
  var _ = require('lodash');

  function scan(options, callback) {

    if (options instanceof Function) {
      callback = options;
      options = {};
    }
    var opts = _.defaults({}, options, {
      root: '.',
      npm: true,
      bower: true
    });

    var dependencies = {
      //npm: {},
      //bower: {}
    };


    var pathsVisited = {};
    var q = async.queue(function(task, cb) {
      if (!task) {
        return cb();
      }
      task(cb);
    });
    q.drain = function() {
      callback(null, dependencies);
    };

    if (opts.npm) {
      q.push(readFile(fspath.resolve(opts.root, 'package.json'), analyzeNpm));
    }
    if (opts.bower) {
      q.push(readFile(fspath.resolve(opts.root, './bower.json'), analyzeBower));
    }
    q.push(null);

    function usepath(path) {
      if (pathsVisited[path]) {
        return false;
      }
      pathsVisited[path] = true;
      return true;
    }

    function readFile(path, analyzer) {
      var path = fspath.resolve(path);
      if (!usepath(path)) {
        return null;
      }

      return function(cb) {
        (opts.mockReadFile || fs.readFile)(path, function onReadNpm(err, data) {
          if (err) {
            return cb(err);
          }
          q.push(analyzer(path, data));
          cb();
        });
      }
    }

    function fixRepoUrl(url) {
      if (url.indexOf('git') === 0) {
        url = url.replace('git://github.com/', 'https://github.com/').replace('git@github.com:', 'https://github.com/');
      }
      if ((/.*\.git$/i).test(url)) {
        url = url.substring(0, url.length - 4);
      }
      return url.replace('http://github.com/', 'https://github.com/');
    }

    function analyzeNpm(path, contents) {
      return function(cb) {
        var json = JSON.parse(contents);

        dependencies.npm = dependencies.npm || {};
        var dep = dependencies.npm[json.name];
        if (!dep) {
          dep = dependencies.npm[json.name] = {
            name: json.name,
            description: json.description || '',
            versions: [json.version],
            licenses: [],
            repositories: []
          };
        }
        dep.versions = _([json.version, [dep.versions]])
          .flatten()
          .filter()
          .uniq()
          .sort()
          .value();
        dep.licenses = _([dep.licenses, json.license, json.licenses])
          .flatten()
          .filter()
          .map(function(l) {
            return _.isString(l) ? l : l.type;
          })
          .filter()
          .uniq()
          .sort()
          .value();
      dep.repositories = _([dep.repositories, json.repository, json.repositories])
          .flatten()
          .filter()
          .map(function(r) {
            return fixRepoUrl((_.isString(r) ? r : r.url) || '');
          })
          .filter()
          .uniq()
          .sort()
          .value();
        function enqueue(deps, relativeTo) {
          _(deps || {}).each(function(version, name) {
            q.push(readFile(fspath.resolve(relativeTo, 'node_modules/' + name + '/package.json'), analyzeNpm));
          });
        }
        enqueue(json.dependencies, fspath.dirname(path));
        enqueue(json.peerDependencies, opts.root);
        enqueue(json.devDependencies, fspath.dirname(path));
        return cb();
      };

    }

    function analyzeBower(path, contents) {
      return function(cb) {
        var json = JSON.parse(contents);

        dependencies.bower = dependencies.bower || {};
        var dep = dependencies.bower[json.name];
        if (!dep) {
          dep = dependencies.bower[json.name] = {
            name: json.name,
            versions: [json.version],
            description: json.description || '',
            licenses: [],
            repositories: []
          };
        }
        dep.versions = _([json.version, [dep.versions]])
          .flatten()
          .uniq()
          .sort()
          .value();
        dep.licenses = _([dep.licenses, json.license, json.licenses])
          .flatten()
          .filter()
          .map(function(l) {
            return _.isString(l) ? l : l.type;
          })
          .filter()
          .uniq()
          .sort()
          .value();
        dep.repositories = _([dep.repositories, json._source])
          .flatten()
          .filter()
          .map(function(r) {
            return fixRepoUrl((_.isString(r) ? r : r.url) || '');
          })
          .filter()
          .uniq()
          .sort()
          .value();
        _(json.dependencies || {}).each(function(version, name) {
          q.push(readFile(fspath.resolve(opts.root, 'bower_components/' + name + '/bower.json'), analyzeBower));
          q.push(readFile(fspath.resolve(opts.root, 'bower_components/' + name + '/.bower.json'), analyzeBower));
        });
        cb();
      }
    }
  }

  module.exports = scan;
})(module);
