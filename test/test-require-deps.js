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

  shim: {
	  'jquery-colorbox' : {
		  deps : ['jquery']
	  }
  },
  paths: {
    jquery: "../bower_components/jquery/dist/jquery",
    requirejs: "../bower_components/requirejs/require",
    "xhr-adaptor-js": "../dist/xhr-adaptor-js",
    "xhrTestUtils": "util/xhrTestUtils"
  },
  packages: [
  ],

  // ask Require.js to load these files (all our tests)
  deps: tests,

  // start test run, once Require.js is done
  callback: window.__karma__.start

});
