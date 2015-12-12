The BlockingRequestQueueXHR class extends the XHRWrapper class by introducing functionality that allows responses from
a particular URL or set of URLs to be intercepted and then to optionally queue all further requests until an
arbitrary asynchronous action has been performed.

One scenario where the need for such functionality arises is when performing session based authentication using ajax.
In such a scenario it is possible that the session may time out while the javascript application is in the process
of sending XHR requests.
Using the BlockingRequestQueueXHR in this case allows for the user to be presented with
an authentication dialog while all further requests are queued.
Once authentication has been successful, the queued requests are sent to the server which now has a valid session.

![Auth Scenario Image](images/BlockingRequestQueueAuthScenario.jpg "Authentication Scenario")
