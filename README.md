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
* Create a unit test to check that resend works as expected, should probably set up a nodejs express test server for this (don't
  want to interfere with xhr-adaptor by using fakeserver)

Developer Notes
---------------
* Looked at adding the ability to have the queue block when the number of entries reaches the prescribed queue limit
  however it seems that this is not possible since 'blocking' in a loop for instance will prevent all processing from
  continuing which would prevent the requesthandler from finishing thereby leading to deadlock. Maybe there is some
  clever way around this?
