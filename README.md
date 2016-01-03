xhr-blocking-queue-js
=================

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

TODO
----
* Fix UT "Will call the callback when posting to URLs that match the filter"
* Add unit test to ensure that eventQueue does not fire event when relayEvent == false (i.e. when doContinue(false) is called)
* Create a unit test to check that resend works as expected, should probably set up a nodejs express test server for this (don't
  want to interfere with xhr-adaptor by using fakeserver)

