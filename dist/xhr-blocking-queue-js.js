define('xhr-blocking-queue-js',
    
	['xhr-adaptor-js'],
    function (xhrAdaptorJsNS) {

		/**
		 * For the AMD module version of the library, the xhrBQJs namespace
		 * does not exist but refers instead to the AMD module itself.
		 *
		 * @summary The xhrAdaptorJs namespace and AMD module
		 * @version 1.0
		 * @exports xhr-bq-adaptor-js
		 * @namespace {object} xhrBQJs
		 */
		var xhrAdaptorJs = xhrAdaptorJsNS;

		var xhrBQJs = xhrBQJs || {};

		var xhrBQJs = xhrBQJs || {};

/**
 * @summary The BlockingRequestQueueXHR allows a response to be intercepted and processed while queuing all other requests until processing is complete
 *
 * This class is allows special processing to occur in certain situations, based on an ajax response, while queuing background requests.
 * A callback is provided to allow the queued requests to be processed meaning that the 'special processing' can occur asynchronously.
 * An example use case for the BlockingRequestQueueXHR is where it can be used to pop open an authentication dialog and wait for a user to authenticate,
 * meanwhile all requests are queued while the system waits for the user's input. This prevents the scenario of having multiple ajax calls being denied since
 * once the user is authenticated, the queued requests can then continue through to the server where they can be processed normally, in an authenticated context.
 *
 * @class
 * @memberOf xhrBQJs
 * @augments xhrAdaptorJs.XHRWrapper
 * @tutorial BlockingRequestQueue
 *
 * @param {XMLHttpRequest} impl The implementation object that this BlockingRequestQueueXHR object is to wrap.
 *
 */
xhrBQJs.BlockingRequestQueueXHR = function(impl) {
	// Set by 'open'
	this.openArgs = null;
	this.parent().constructor.call(this, impl);
};

xhrBQJs.BlockingRequestQueueXHR.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
xhrBQJs.BlockingRequestQueueXHR.constructor = xhrBQJs.BlockingRequestQueueXHR;

//////////////////////////////// 'private' functions /////////////////////////////////////////////

/**
 * Creates a callback which is associated to the provided requestHandlerObj
 * that, when called, will unblock the request queue, allowing requests to
 * be processed.
 *
 * @summary Create a 'continue' callback function for the user defined function to call
 * @global
 * @private
 * @param {Object} delegateObj The event delegate object provided to the XHRWrapper 'onreadystatechange' event
 * @param {Object} requestHandlerEntry The requestHandlerEntry that the continue callback will unblock
 * @param {...any} args Arguments that were passed to the initial 'onreadystatechange' event delegate callback.
 * @returns {Function} Returns a function that when called, will unblock the request queue
 */
function createContinueCallback(delegateObj, requestHandlerEntry, args) {

	return function (relayEvent) {

		if(relayEvent || relayEvent === undefined) {
			delegateObj.applyRealHandler(args);
		}

		requestHandlerEntry.isBlocked = false;

		// Process all of the remaining requests
		var requestQueue = xhrBQJs.BlockingRequestQueueXHR.prototype.requestQueue;

		if(requestQueue === undefined)
			return;
		while(requestQueue.length > 0) {
			var request = xhrBQJs.BlockingRequestQueueXHR.prototype.requestQueue.shift();
			request();
		}
	};
}

/**
 * Returns either the response handler entry that matches the URL of this
 * XHR object or NULL if there is no matching response handler.
 *
 * @summary Find the first request handler entry that matches the provided request URL
 * @global
 * @private
 * @param {String} requestURL The URL that is being matched.
 * @returns {Object} Either the request handler entry that matches the URL or null if there are no matches.
 */
function findResponseHandlerMatch(requestURL) {
	//var handlerMap = Object.getPrototypeOf(this).responseHandlerMap;
	for(var key in this.responseHandlerMap) {
		if(!this.responseHandlerMap.hasOwnProperty(key)) continue;

		if(new RegExp(key, "g").test(requestURL))
			return Object.getPrototypeOf(this).responseHandlerMap[key];
	}
	return null;
}

/**
 * This method will invoke the first matching response handler, causing any further matching requests
 * to be blocked until the 'continue' callback is invoked in the user defined response handler.
 * If there are no matching response handler entries then the response will pass through as normal.
 *
 * @summary Invoke the first matching response handler.
 * @global
 * @private
 * @param {...any} args Arguments that were passed to the initial 'onreadystatechange' event delegate callback.
 */
function processResponse(args) {

	var me = this;
	
	// Check each of the registered response handlers to see if their key (a regex)
	// matches the URL that is being opened
	var handlerObj = findResponseHandlerMatch.call(this._xhr, this._xhr.getRequestURL());
	
	if(handlerObj === null) {
		// No match, just allow the request to continue as usual
		me.applyRealHandler(args);
		return;
	}

	// There is a match but before calling the handler, check if the request is already blocked
	if(handlerObj.isBlocked) {
		this._xhr.resend();
		console.debug("Failed to catch blocked request in time, ignoring response and adding request to queue.");
		return;
	}
	
	// Set the matching handler to blocked and invoke it
	handlerObj.invokeHandler(this, args);
}
////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////// 'statics' ////////////////////////////////////////////////////

/**
 * @summary The static response handler entry map
 *
 * This map stores all the response handler entries registered by {@link xhrBQJs.BlockingRequestQueueXHR.registerResponseHandler}
 * The response handler entries are stored in 'key => value' pairs where the key is a URL regEx and the value is
 * an object with the following fields:
 *   handler: A function which represents the response handler set by the caller
 *   blocked: A boolean flag indicating whether requests matching this key are currently blocked.
 *
 * @memberOf xhrBQJs.BlockingRequestQueueXHR
 * @static
 * @private
 * @type {Object}
 *
 */
xhrBQJs.BlockingRequestQueueXHR.prototype.responseHandlerMap = {};

/**
 * @summary The request queue
 *
 * The request queue of blocked requests. This is an array of closure functions wrapping
 * either the parent classes 'send', 'onload' or 'onreadystatechange' method.
 * This allows requests to be 'suspended' and then later resumed by calling the closure.
 *
 * @memberOf xhrBQJs.BlockingRequestQueueXHR
 * @static
 * @private
 * @type {Array}
 *
 */
xhrBQJs.BlockingRequestQueueXHR.prototype.requestQueue = [];
//////////////////////////////////////////////////////////////////////////////////////////

//
/**
 * @summary Open the specified URL
 *
 * This simple override is used to capture the URL of the XHR request so it can be retrieved later when
 * 'send' is called.
 *
 * @memberOf xhrBQJs.BlockingRequestQueueXHR
 * @private
 */
xhrBQJs.BlockingRequestQueueXHR.prototype.open = function(verb, url, async) {
	this.openArgs = arguments;
	this.parent().open.apply(this, this.openArgs);
};

/**
 * @summary send the request
 *
 * This override will check to see if the request URL matches that of a currently blocked
 * response handler entry. If the response handler entry for the URL is blocked then the request is simply queued for later
 * execution.
 *
 * @memberOf xhrBQJs.BlockingRequestQueueXHR
 * @private
 */
xhrBQJs.BlockingRequestQueueXHR.prototype.send = function() {

	var me = this;

	var args = arguments;
	
	// Check each of the registered response handlers to see if their key (a regex)
	// matches the URL that is being opened
	var handlerObj = findResponseHandlerMatch.call(this, this.getRequestURL());
	
	// There is a match so check if the request is blocked
	if(handlerObj !== null && handlerObj.isBlocked) {
		// Add the handler to the queue as a closure but do not call it yet
		xhrBQJs.BlockingRequestQueueXHR.prototype.requestQueue.push(function() {
			me.parent().send.apply(me, args);
		});
		return;
	}

	me.parent().send.apply(me, args);
};

/**
 * @summary Resend the request
 * @description
 * This convenience method will resend a request by performing the following steps:
 * - Calling 'open' again on the underlying xhr object, passing the same arguments that were originally given.
 * - Calling 'send' again on the underlying xhr object.
 *
 * @memberOf xhrBQJs.BlockingRequestQueueXHR
 * @private
 */
xhrBQJs.BlockingRequestQueueXHR.prototype.resend = function() {
	this.open.apply(this, this.openArgs);
	this.send.apply(this, arguments);
};

/**
 * @summary Get the request URL
 * @description
 * Retrieves the request URL that was passed to 'open'
 *
 * @memberOf xhrBQJs.BlockingRequestQueueXHR
 * @private
 * @returns {String} The request URL or null if one has not been provided.
 */
xhrBQJs.BlockingRequestQueueXHR.prototype.getRequestURL = function() {

	if(this.openArgs === null || this.openArgs.length < 2) {
		return null;
	}
	return this.openArgs[1];
};

/**
 * @summary Get the request verb (e.g. 'get', 'post' etc)
 * @description
 * Retrieves the request verb that was passed to 'open'
 *
 * @memberOf xhrBQJs.BlockingRequestQueueXHR
 * @private
 * @returns {String} The request verb or null if one has not been provided.
 */
xhrBQJs.BlockingRequestQueueXHR.prototype.getRequestVerb = function() {

	if(this.openArgs === null || this.openArgs.length < 1) {
		return null;
	}
	return this.openArgs[0];
};


/**
 * @summary Register a response handler and a URL matching regular expression.
 * @description
 * This method should be used to register a response handler for a particular URL.
 * The provided response handler should be a function which takes the following two arguments:
 *
 * - doContinue - This is a function that should be called to signal that request processing should continue (see below)
 * - xhr 	    - This is the XMLHttpRequest object that sent the request (actually a BlockingRequestQueueXHR object)
 *
 * When the provided response handler callback is called, all further requests that match the associated URL
 * regular expression will be queued until the 'doContinue' callback function is invoked.
 *
 * The 'doContinue' function itself supports one optional boolean argument (defaults to true) which when true will cause the
 * response to be relayed back to the XMLHttpRequest object that initiated the request. If this argument is false then
 * the event will not be relayed.
 *
 * @example
 * <caption>
 * <H4>Example response handler</H4>
 * This example shows what a simple response handler function should look like.
 * </caption>
 *     var responseHandler = function(doContinue, xhr) {

 *     		if(xhr.responseText == "Whoa!! not so fast, you need to log in!") {
 *     			// Do some stuff
 *     			...
 *     			// Call this when finished, passing false to indicate that we handled the event
 *     			// Note that there is no need to necessarily have to call this within this function,
 *     			// doContinue could also be called say, on a 'onClick' event of a button or something similar.
 *     			doContinue(false);
 *     		} else {
 *     			// No need to do anything here, just continue and pass true to indicate that this
 *     			// event is to be handled by the XMLHttpRequest object that sent it.
 *     			doContinue(true);
 *     		}
 *     }
 *
 * @example
 * <caption>
 * <H4>Example registration of a response handler</H4>
 * This example shows how to register a response handler that will be executed when
 * requesting any URL containing 'www.acme.com'.
 * </caption>
 *     xhrBQJs.BlockingRequestQueueXHR.registerResponseHandler("www.acme.com", responseHandler);
 *
 * @function registerResponseHandler
 * @memberOf xhrBQJs.BlockingRequestQueueXHR
 * @static
 * @param {String} urlRegEx The URL regular expression string (without the starting and ending forward slash).
 * @param {Function} responseHandler The response handler function that is to be invoked on a matching URL.
 * @param {Object} [handlerContext] This optional argument allows for a context object to be used when invoking the response handler.
 * 									If one is not provided then the BlockingRequestQueueXHR object will be used as the call context.
 */
xhrBQJs.BlockingRequestQueueXHR.prototype.registerResponseHandler = function(urlRegEx, responseHandler, handlerContext) {

	if(urlRegEx in xhrBQJs.BlockingRequestQueueXHR.prototype.responseHandlerMap) {
		console.error("Attempted to register handler for existing regex expression '" + urlRegEx + "'");
		return;
	}

	var me = this;

	var requestHandlerEntry = {
		handler: responseHandler,
		context: handlerContext || me,
		isBlocked: false,
		invokeHandler : function (delegateObj, args) {
			requestHandlerEntry.isBlocked = true;
			requestHandlerEntry.handler.call(handlerContext, createContinueCallback(delegateObj, requestHandlerEntry, args), delegateObj._xhr);
		}
	};

	xhrBQJs.BlockingRequestQueueXHR.prototype.responseHandlerMap[urlRegEx] = requestHandlerEntry;
};
xhrBQJs.BlockingRequestQueueXHR.registerResponseHandler = xhrBQJs.BlockingRequestQueueXHR.prototype.registerResponseHandler;

/**
 * @summary unregister a response handler entry.
 *
 * This method is used to unregister a previously registered response handler.
 *
 * @function unregisterResponseHandler
 * @memberOf xhrBQJs.BlockingRequestQueueXHR
 * @static
 * @param {String} urlRegEx The URL regular expression string that was used to register the response handler
 *                          that should now be unregistered.
 */
xhrBQJs.BlockingRequestQueueXHR.prototype.unregisterResponseHandler = function(urlRegEx) {
	delete xhrBQJs.BlockingRequestQueueXHR.prototype.responseHandlerMap[urlRegEx];
};
xhrBQJs.BlockingRequestQueueXHR.unregisterResponseHandler = xhrBQJs.BlockingRequestQueueXHR.prototype.unregisterResponseHandler;

/**
 * @summary unregister all response handler entries.
 *
 * @function clearResponseHandlers
 * @memberOf xhrBQJs.BlockingRequestQueueXHR
 * @static
 */
xhrBQJs.BlockingRequestQueueXHR.prototype.clearResponseHandlers = function() {
	xhrBQJs.BlockingRequestQueueXHR.prototype.responseHandlerMap = {};
};
xhrBQJs.BlockingRequestQueueXHR.clearResponseHandlers = xhrBQJs.BlockingRequestQueueXHR.prototype.clearResponseHandlers;

/**
 * @summary Hook the 'onreadystatechange' event so that the response handlers can be checked.
 *
 * @memberOf xhrBQJs.BlockingRequestQueueXHR
 * @static
 * @private
 */
xhrBQJs.BlockingRequestQueueXHR.prototype.eventDelegate = {
	onreadystatechange : function () {
		
		var args = arguments;
		var xhr = this._xhr;
		
		if(xhr.readyState == 4) {
			processResponse.call(this, args);
		} else {
			// NB make sure you always call this as the ActiveX version of XHR
			// will actually cease to call onreadystatechange if this is not called
			// i.e. you will only get the first event where readyState == 1
			this.applyRealHandler(args);
		}
	}
	//TODO: Detect if onload is implemented and use in preference to onreadystatechange
	/*
	onload : function () {
		processResponse.call(this, arguments);
	}
	*/
};


		return xhrBQJs;
	}
);
