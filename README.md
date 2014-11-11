## credits-to
```
$ npm install credits-to
```

Summarize npm and bower dependencies so you can give credit ;)

- collects installed information only, ie package.json, bower.json/.bower.json must exist
- collects all versions
- handles dependencies, devDependencies, peerDependencies

## Usage

```
var creditsto = require('credits-to');

creditsto(function (err, credits){
  console.log(credits);
});

creditsto({root: '.', bower: true, npm: true}, function (err, credits){
  console.log(credits);
}); 

```

## Output
The result (```credits``` above) will be similar to below (which is taken from unit test output)

```
{
  "bower": {
    "app.js": {
      "name": "app.js",
      "versions": [
        null
      ],
      "description": "",
      "licenses": [
        "MIT"
      ],
      "repositories": []
    },
    "bootstrap": {
      "name": "bootstrap",
      "versions": [
        "3.3.0"
      ],
      "description": "The most popular front-end framework for developing responsive, mobile first projects on the web.",
      "licenses": [],
      "repositories": [
        "https://github.com/twbs/bootstrap"
      ]
    },
    "jquery": {
      "name": "jquery",
      "versions": [
        "2.1.1"
      ],
      "description": "",
      "licenses": [
        "MIT"
      ],
      "repositories": [
        "https://github.com/jquery/jquery"
      ]
    }
  },
  "npm": {
    "App": {
      "name": "App",
      "description": "",
      "versions": [],
      "licenses": [],
      "repositories": []
    },
    "fixer": {
      "name": "fixer",
      "description": "nodejs fixer of things",
      "versions": [
        "1.0.0"
      ],
      "licenses": [
        "ICS"
      ],
      "repositories": [
        "https://github.com/handy/man"
      ]
    },
    "doer": {
      "name": "doer",
      "description": "nodejs doer of stuff",
      "versions": [
        "1.2.3",
        "1.3.0"
      ],
      "licenses": [
        "BSD",
        "BSD2"
      ],
      "repositories": []
    },
    "tester": {
      "name": "tester",
      "description": "nodejs testing",
      "versions": [
        "9.1.1"
      ],
      "licenses": [
        "MIT"
      ],
      "repositories": [
        "https://github.com/bravestar/tester"
      ]
    },
    "peerie": {
      "name": "peerie",
      "description": "",
      "versions": [
        "1.5.0"
      ],
      "licenses": [
        "MIT"
      ],
      "repositories": []
    }
  }
}

```
