var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/Test\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

require.config({

  baseUrl: '/base/test',

  paths: {
    requirejs: "../bower_components/requirejs/require",
    jquery: "../bower_components/jquery/dist/jquery",
    "xhr-adaptor-js": "../bower_components/xhr-adaptor-js/dist/xhr-adaptor-js",
    "xhr-blocking-queue-js": "../dist/xhr-blocking-queue-js",
    "xhrTestUtils": "util/xhrTestUtils"
  },
  packages: [
  ],

  // ask Require.js to load these files (all our tests)
  deps: tests,

  // start test run, once Require.js is done
  callback: window.__karma__.start

});
