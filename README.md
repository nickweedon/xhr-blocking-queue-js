xhr-adaptor-js
==============

Building
--------
1. Download and install npm (under windows install nodejs)
2. Run:'npm install -g grunt-cli'  
*(NB: Some modules will fail to install if running this command from Cygwin or if running from cmd but using a Cygwin version of git)*
3. Within this directory run 'npm install'
4. Run 'grunt'

Command line unit testing
-------------------------
Run:  
>grunt test
  
Browser based unit testing and manual testing 
---------------------------------------------
Browser based unit testing is currently required to test Internet Explorer compatibility.
Run:  
>grunt test-server  

This will start the test HTTP server and print the URLs of both the unit test site and the manual test/fiddle site.

Debugging
---------
Note that when debugging it is often useful to run unit tests through the manual web interface test via:  

>grunt test-server

This will often yield much more useful error information in the javascript console than when run via commandline. The commandline version of the unit tests has a habit of outputting useless error information such as:  

> PhantomJS timed out, possibly due to a missing QUnit start() call

Oddly, the converse situation is sometimes also true in so far as that the commandline unit tests can sometimes produce debug information that is not shown in the web interface.

TODO
----
* FakeServer - Create new XHRWrapper derived class that allows you to return responses (like expect -> return this). Needed to unit test SAML client.
* CORS XHRWrapper - A CORS XHRWrapper would be a cool idea.
* Transparent ajax redirector - This would be a neat idea since you could redirect to a 'redirector' type plugin/thing
  on the server and then have it redirect to the real server, preventing the need for CORS.
