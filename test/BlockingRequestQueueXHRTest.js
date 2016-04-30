describe('BlockingRequestQueueXHR Test', function() {

    var xhrBQJs = null;
    var xhrAdaptorJs = null;
    var xhrTestUtils = null;
    var $ = null;

    beforeEach(function(done) {
        require(["xhr-blocking-queue-js", "xhr-adaptor-js", "xhrTestUtils", "jquery"], function(xhrBQJsNS, xhrAdaptorJsNS, xhrTestUtilsNS, jqueryNS) {
            xhrBQJs = xhrBQJsNS;
            xhrAdaptorJs = xhrAdaptorJsNS;
            xhrTestUtils = xhrTestUtilsNS;
            $ = jqueryNS;
            done();
        });
    });

    afterEach(function () {
        xhrAdaptorJs.manager.resetXHR();
        xhrBQJs.BlockingRequestQueueXHR.clearResponseHandlers();
    });

    describe('BlockingRequestQueueXHR class method tests', function() {

        it("Can instantiate successfully", function () {
            var xhr = new xhrBQJs.BlockingRequestQueueXHR(xhrTestUtils.createNativeXhr());
            assert.ok(xhr !== undefined, "Failed to instantiate xhrBQJs.BlockingRequestQueueXHR");
        });

        it("Can record set single request header correctly and use getAllRequestHeaders to retrieve it", function () {
            var xhr = new xhrBQJs.BlockingRequestQueueXHR(xhrTestUtils.createNativeXhr());

            xhr.open("GET", "http://www.nonsense.com");
            xhr.setRequestHeader("content-type", "blah");

            assert.deepEqual(xhr.getAllRequestHeaders(), {
                "content-type" : ["blah"]
            });

            //assert.ok(xhr !== undefined, "Failed to instantiate xhrBQJs.BlockingRequestQueueXHR");
        });

        it("Can record many request headers correctly and use getAllRequestHeaders to retrieve them", function () {
            var xhr = new xhrBQJs.BlockingRequestQueueXHR(xhrTestUtils.createNativeXhr());

            xhr.open("GET", "http://www.nonsense.com");
            xhr.setRequestHeader("content-type", "blah");
            xhr.setRequestHeader("custom-header", "somevalue");

            assert.deepEqual(xhr.getAllRequestHeaders(), {
                "content-type" : ["blah"],
                "custom-header" : ["somevalue"]
            });

            //assert.ok(xhr !== undefined, "Failed to instantiate xhrBQJs.BlockingRequestQueueXHR");
        });

        it("Can record multivalued request headers correctly and use getAllRequestHeaders to retrieve them", function () {
            var xhr = new xhrBQJs.BlockingRequestQueueXHR(xhrTestUtils.createNativeXhr());

            xhr.open("GET", "http://www.nonsense.com");
            xhr.setRequestHeader("content-type", "blah");
            xhr.setRequestHeader("content-type", "something else");
            xhr.setRequestHeader("custom-header", "somevalue");

            assert.deepEqual(xhr.getAllRequestHeaders(), {
                "content-type" : ["blah", "something else"],
                "custom-header" : ["somevalue"]
            });

            //assert.ok(xhr !== undefined, "Failed to instantiate xhrBQJs.BlockingRequestQueueXHR");
        });

        it("Can check for the existence of a request header", function () {
            var xhr = new xhrBQJs.BlockingRequestQueueXHR(xhrTestUtils.createNativeXhr());

            xhr.open("GET", "http://www.nonsense.com");
            xhr.setRequestHeader("content-type", "blah");
            xhr.setRequestHeader("content-type", "something else");
            xhr.setRequestHeader("custom-header", "somevalue");

            assert.ok(xhr.isRequestHeaderSet("custom-header"));
        });

        it("Can check for the absense of a request header", function () {
            var xhr = new xhrBQJs.BlockingRequestQueueXHR(xhrTestUtils.createNativeXhr());

            xhr.open("GET", "http://www.nonsense.com");
            xhr.setRequestHeader("content-type", "blah");
            xhr.setRequestHeader("content-type", "something else");
            xhr.setRequestHeader("custom-header", "somevalue");

            assert.notOk(xhr.isRequestHeaderSet("crazy-header"));
        });

        it("Can check if a request header contains a value", function () {
            var xhr = new xhrBQJs.BlockingRequestQueueXHR(xhrTestUtils.createNativeXhr());

            xhr.open("GET", "http://www.nonsense.com");
            xhr.setRequestHeader("content-type", "blah");
            xhr.setRequestHeader("content-type", "something else");
            xhr.setRequestHeader("custom-header", "somevalue");

            assert.ok(xhr.requestHeaderContains("content-type", "something else"));
            assert.ok(xhr.requestHeaderContains("content-type", "blah"));
        });

        it("Can check if a request header does not contain a value", function () {
            var xhr = new xhrBQJs.BlockingRequestQueueXHR(xhrTestUtils.createNativeXhr());

            xhr.open("GET", "http://www.nonsense.com");
            xhr.setRequestHeader("content-type", "blah");
            xhr.setRequestHeader("content-type", "something else");
            xhr.setRequestHeader("custom-header", "somevalue");

            assert.notOk(xhr.requestHeaderContains("content-type", "something weird"));
            assert.notOk(xhr.requestHeaderContains("hello", "blah"));
        });

        it("Can retrieve all values of a request header correctly using getRequestHeaders", function () {
            var xhr = new xhrBQJs.BlockingRequestQueueXHR(xhrTestUtils.createNativeXhr());

            xhr.open("GET", "http://www.nonsense.com");
            xhr.setRequestHeader("content-type", "blah");
            xhr.setRequestHeader("content-type", "something else");
            xhr.setRequestHeader("custom-header", "somevalue");

            assert.deepEqual(xhr.getRequestHeaders("content-type"), [
                "blah",
                "something else"
            ]);
        });

        it("Correctly returns empty array for non-existent request header", function () {
            var xhr = new xhrBQJs.BlockingRequestQueueXHR(xhrTestUtils.createNativeXhr());

            xhr.open("GET", "http://www.nonsense.com");
            xhr.setRequestHeader("content-type", "blah");
            xhr.setRequestHeader("content-type", "something else");
            xhr.setRequestHeader("custom-header", "somevalue");

            assert.deepEqual(xhr.getRequestHeaders("something-silly"), []);
        });

        it("Can set add many request headers using addRequestHeaders", function () {

            var xhr = new xhrBQJs.BlockingRequestQueueXHR(xhrTestUtils.createNativeXhr());

            var requestHeaders = {
                "content-type" : ["blah", "something else"],
                "custom-header" : ["somevalue"]
            };

            xhr.open("GET", "http://www.nonsense.com");
            xhr.addRequestHeaders(requestHeaders);

            assert.deepEqual(requestHeaders, xhr.getAllRequestHeaders());
        });

        //TODO: Create a unit test to check that resend works as expected, should probably set up a nodejs express test server for this
    });

    describe('BlockingRequestQueueXHR blocking behavior tests', function() {

        it("Can send to URLs not matching the filter", function (done) {

            var requestHandler = {
                doStuff: function () {
                    assert.ok(false, "Not expecting this to be called");
                }
            };
            xhrBQJs.BlockingRequestQueueXHR.registerResponseHandler("http://www.google.com", requestHandler.doStuff, requestHandler);
            xhrAdaptorJs.manager.injectWrapper(xhrBQJs.BlockingRequestQueueXHR);

            xhr = new XMLHttpRequest();
            xhr.open("get", "data/simpleSentence.txt");
            xhr.onreadystatechange = function () {
                if (this.readyState == 4) {
                    done();
                }
            };
            xhr.send();
        });

        it("Can send via jquery to URLs not matching the filter", function (done) {

            var requestHandler = {
                doStuff: function () {
                    assert.ok(false, "Not expecting this to be called");
                }
            };
            xhrBQJs.BlockingRequestQueueXHR.registerResponseHandler("http://www.google.com", requestHandler.doStuff, requestHandler);
            xhrAdaptorJs.manager.injectWrapper(xhrBQJs.BlockingRequestQueueXHR);

            $.get("data/simpleSentence.txt", function () {
                done();
            });
        });

        it("Will call the callback when getting URLs that match the filter", function (done) {

            var responseHandlerCallback = sinon.spy();

            var responseHandler = function (doContinue) {
                responseHandlerCallback();
                doContinue();
            };
            xhrBQJs.BlockingRequestQueueXHR.registerResponseHandler("data", responseHandler);
            xhrAdaptorJs.manager.injectWrapper(xhrBQJs.BlockingRequestQueueXHR);

            xhr = new XMLHttpRequest();
            xhr.open("get", "data/simpleSentence.txt");
            xhr.onreadystatechange = function () {
                if (this.readyState == 4) {
                    sinon.assert.calledOnce(responseHandlerCallback);
                    done();
                }
            };
            xhr.send();
        });

        it("Will call the callback when posting to URLs that match the filter", function (done) {

            //FIXME: Need to actually check that the POST sent data and also add another test to check that blocked posts still send data
            // Will probably need to set up a nodejs express server for this

            var responseHandlerCallback = sinon.spy();

            var responseHandler = function (doContinue) {
                responseHandlerCallback();
                doContinue();
            };
            xhrBQJs.BlockingRequestQueueXHR.registerResponseHandler("data", responseHandler);
            xhrAdaptorJs.manager.injectWrapper(xhrBQJs.BlockingRequestQueueXHR);

            xhr = new XMLHttpRequest();
            xhr.open("post", "data/simpleSentence.txt");
            xhr.onreadystatechange = function () {
                if (this.readyState == 4) {
                    sinon.assert.calledOnce(responseHandlerCallback);
                    done();
                }
            };
            xhr.send();
        });

        it("Can use jquery to cause other calls to block after sending to URL that matches filter and before continue is called", function (done) {

            var firstXHRCallback = sinon.spy();
            var secondXHRCallback = sinon.spy();
            var responseHandlerCallback = sinon.spy();

            var hasContinued = false;

            var responseHandler = function (doContinue, xhr) {
                if (xhr.responseText == "Authorization required!") {
                    responseHandlerCallback();

                    // Now that the first request is blocking, send a second request...
                    $.get("/data/secondSentence.txt", function (data) {
                        sinon.assert.calledOnce(responseHandlerCallback);
                        assert.equal(data, "hi this is another sentence", "Failed to retrieve data");
                        assert.equal(hasContinued, true, "Second call has completed before the first call has 'continued'");
                        sinon.assert.notCalled(firstXHRCallback);
                        done();
                    }).fail(function () {
                        sinon.assert.fail("Ajax error!");
                    });

                    // After half a second, continue the first request and unblock the queue
                    setTimeout(function () {
                        hasContinued = true;
                        // Pass false to doContinue to signal that
                        // we do not want this response to be passed back to the caller
                        doContinue(false);
                    }, 500);
                } else {
                    doContinue(true);
                }
            };
            xhrBQJs.BlockingRequestQueueXHR.registerResponseHandler("data", responseHandler);
            xhrAdaptorJs.manager.injectWrapper(xhrBQJs.BlockingRequestQueueXHR);

            $.get("/data/needAuth.txt", function () {
                firstXHRCallback();
            });
        });

        it("Can cause other calls to block after sending to URL that matches filter and before continue is called", function (done) {

            var firstXHRCallback = sinon.spy();
            var responseHandlerCallback = sinon.spy();

            var hasContinued = false;

            var responseHandler = function (doContinue, xhr) {
                if (xhr.responseText == "Authorization required!") {
                    responseHandlerCallback();

                    // Now that the first request is blocking, send a second request...
                    var secondXhr = new XMLHttpRequest();
                    secondXhr.open("get", "data/secondSentence.txt");
                    secondXhr.onreadystatechange = function () {

                        if (this.readyState == 4) {
                            sinon.assert.calledOnce(responseHandlerCallback);
                            assert.equal(this.responseText, "hi this is another sentence", "Failed to retrieve data");
                            assert.equal(hasContinued, true, "Second call has completed before the first call has 'continued'");
                            sinon.assert.notCalled(firstXHRCallback);
                            done();
                        }
                    };
                    secondXhr.send();

                    // After half a second, continue the first request and unblock the queue
                    setTimeout(function () {
                        hasContinued = true;
                        // Pass false to doContinue to signal that
                        // we do not want this response to be passed back to the caller
                        doContinue(false);
                    }, 500);
                } else {
                    doContinue(true);
                }
            };
            xhrBQJs.BlockingRequestQueueXHR.registerResponseHandler("data", responseHandler);
            xhrAdaptorJs.manager.injectWrapper(xhrBQJs.BlockingRequestQueueXHR);

            var xhr = new XMLHttpRequest();
            xhr.open("get", "data/needAuth.txt");
            xhr.onreadystatechange = function () {
                if (this.readyState == 4) {
                    firstXHRCallback();
                }
            };
            xhr.send();
        });

        it("Will continue if an exception occurs", function (done) {

            var firstXHRCallback = sinon.spy();
            var responseHandlerCallback = sinon.spy();

            var responseHandler = function (doContinue, xhr) {
                if (xhr.responseText == "Authorization required!") {
                    responseHandlerCallback();

                    // Now that the first request is blocking, send a second request...
                    var secondXhr = new XMLHttpRequest();
                    secondXhr.open("get", "data/secondSentence.txt");
                    secondXhr.onreadystatechange = function () {

                        if (this.readyState == 4) {
                            sinon.assert.calledOnce(responseHandlerCallback);
                            assert.equal(this.responseText, "hi this is another sentence", "Failed to retrieve data");
                            sinon.assert.notCalled(firstXHRCallback);
                            done();
                        }
                    };
                    secondXhr.send();

                    throw "Some silly error";
                } else {
                    doContinue(true);
                }
            };
            xhrBQJs.BlockingRequestQueueXHR.registerResponseHandler("data", responseHandler);
            xhrAdaptorJs.manager.injectWrapper(xhrBQJs.BlockingRequestQueueXHR);

            var xhr = new XMLHttpRequest();
            xhr.open("get", "data/needAuth.txt");
            xhr.onreadystatechange = function () {
                if (this.readyState == 4) {
                    firstXHRCallback();
                }
            };
            xhr.send();
        });

/*
        //TODO: Finish this if possible or delete (may not be possible to do this)
        it("Will block all other calls when queue limit is reached", function (done) {
            var firstXHRCallback = sinon.spy();
            var secondXHRCallback = sinon.spy();
            var responseHandlerCallback = sinon.spy();
            var elapsedTime = 0;

            var hasContinued = false;

            var responseHandler = function (doContinue, xhr) {
                if (xhr.responseText == "Authorization required!") {
                    responseHandlerCallback();

                    // Now that the first request is blocking, send a second request...
                    var secondXhr = new XMLHttpRequest();
                    secondXhr.open("get", "data/secondSentence.txt");
                    secondXhr.onreadystatechange = function () {
                        if (this.readyState == 4) {
                            secondXHRCallback();
                        }
                    };
                    secondXhr.send();

                    var thirdXhr = new XMLHttpRequest();
                    thirdXhr.open("get", "data/secondSentence.txt");
                    thirdXhr.onreadystatechange = function () {
                        if (this.readyState == 4) {
                            sinon.assert.calledOnce(responseHandlerCallback);
                            assert.equal(this.responseText, "hi this is another sentence", "Failed to retrieve data");
                            assert.equal(hasContinued, true, "Second call has completed before the first call has 'continued'");
                            sinon.assert.notCalled(firstXHRCallback);
                            sinon.assert.calledOnce(secondXHRCallback);
                            assert.isAbove(elapsedTime, 500, 'Blocking queue should be full and block');
                            done();
                        }
                    };
                    var dateOne = new Date();
                    var timeOne = dateOne.getTime();
                    thirdXhr.send();
                    var dateTwo = new Date();
                    var timeTwo = dateTwo.getTime();
                    elapsedTime = timeTwo - timeOne;
                    console.debug('elapsedTime: ' + elapsedTime);

                    // After half a second, continue the first request and unblock the queue
                    setTimeout(function () {
                        hasContinued = true;
                        // Pass false to doContinue to signal that
                        // we do not want this response to be passed back to the caller
                        doContinue(false);
                    }, 500);
                } else {
                    doContinue(true);
                }
            };
            xhrBQJs.BlockingRequestQueueXHR.registerResponseHandler("data", responseHandler);
            xhrAdaptorJs.manager.injectWrapper(xhrBQJs.BlockingRequestQueueXHR);

            var xhr = new XMLHttpRequest();
            xhr.open("get", "data/needAuth.txt");
            xhr.onreadystatechange = function () {
                if (this.readyState == 4) {
                    firstXHRCallback();
                }
            };
            xhr.send();

        });
*/


        it("Will allow blocked request to be overriden with new call and will block all requests until continue", function (done) {

            // Ensure that a blocked request can be modified and then queued while discarding the original request.

            var responseHandlerCallback = sinon.spy();
            var firstXHRCallback = sinon.spy();

            var hasContinued = false;
            // Use this flag to simulate whether a user is logged in or not
            var isAuthedSession = false;

            var responseHandler = function (doContinue, xhr) {
                // In a real scenario we would not need 'isAuthedSession' because we would simply not get
                // "Authorization required!" as a response when we are authenticated.
                if (xhr.responseText == "Authorization required!" && !isAuthedSession) {
                    responseHandlerCallback();
                    // Override this request with a new request and send it (should be queued)
                    xhr.open("get", "data/needAuth.txt");
                    xhr.send();
                    setTimeout(function () {
                        isAuthedSession = true;
                        hasContinued = true;
                        doContinue(false);
                    }, 500);
                } else {
                    doContinue(true);
                }
            };

            xhrBQJs.BlockingRequestQueueXHR.registerResponseHandler("data", responseHandler);
            xhrAdaptorJs.manager.injectWrapper(xhrBQJs.BlockingRequestQueueXHR);

            xhr = new XMLHttpRequest();
            xhr.open("get", "data/needAuth.txt");
            xhr.onreadystatechange = function () {
                if (this.readyState == 4) {
                    firstXHRCallback(hasContinued);
                }
            };
            xhr.send();

            secondXhr = new XMLHttpRequest();
            secondXhr.open("get", "data/secondSentence.txt");
            secondXhr.onreadystatechange = function () {

                if (this.readyState == 4) {
                    assert.equal(this.responseText, "hi this is another sentence", "Failed to retrieve data");
                    assert.equal(hasContinued, true, "Second call has completed before the first call has 'continued'");
                    sinon.assert.calledOnce(responseHandlerCallback);
                    sinon.assert.calledOnce(firstXHRCallback);
                    sinon.assert.calledWith(firstXHRCallback, true);
                    done();
                }
            };
            secondXhr.send();
        });

        it("Can bypass filter when bypassFilter is set", function (done) {
            var firstXHRCallback = sinon.spy();
            var secondXHRCallback = sinon.spy();
            var responseHandlerCallback = sinon.spy();

            var hasContinued = false;

            var responseHandler = function (doContinue, xhr) {
                if (xhr.responseText == "Authorization required!") {
                    responseHandlerCallback();

                    // Now that the first request is blocking, send a second request...
                    var secondXhr = new XMLHttpRequest();
                    secondXhr.bypassFilter = true;
                    secondXhr.open("get", "data/secondSentence.txt");
                    secondXhr.onreadystatechange = function () {

                        if (this.readyState == 4) {
                            sinon.assert.calledOnce(responseHandlerCallback);
                            assert.equal(this.responseText, "hi this is another sentence", "Failed to retrieve data");
                            assert.equal(hasContinued, false, "Second call should complete before the first call has 'continued' (bypassing the filter)");
                            sinon.assert.notCalled(firstXHRCallback);
                            done();
                        }
                    };
                    secondXhr.send();

                    // After half a second, continue the first request and unblock the queue
                    setTimeout(function () {
                        hasContinued = true;
                        // Pass false to doContinue to signal that
                        // we do not want this response to be passed back to the caller
                        doContinue(false);
                    }, 500);
                } else {
                    doContinue(true);
                }
            };
            xhrBQJs.BlockingRequestQueueXHR.registerResponseHandler("data", responseHandler);
            xhrAdaptorJs.manager.injectWrapper(xhrBQJs.BlockingRequestQueueXHR);

            var xhr = new XMLHttpRequest();
            xhr.open("get", "data/needAuth.txt");
            xhr.onreadystatechange = function () {
                if (this.readyState == 4) {
                    firstXHRCallback();
                }
            };
            xhr.send();
        });

        it("Will bypass handler when bypassFilter is set", function (done) {

            var responseHandlerCallback = sinon.spy();

            xhrBQJs.BlockingRequestQueueXHR.registerResponseHandler("data", function (doContinue, xhr) {
                responseHandlerCallback(doContinue, xhr);
                doContinue();
            });
            xhrAdaptorJs.manager.injectWrapper(xhrBQJs.BlockingRequestQueueXHR);

            var xhr = new XMLHttpRequest();
            xhr.bypassFilter = true;
            xhr.open("get", "data/needAuth.txt");
            xhr.onreadystatechange = function () {
                if (this.readyState == 4) {
                    sinon.assert.notCalled(responseHandlerCallback);
                    done();
                }
            };
            xhr.send();
        });
    });
});