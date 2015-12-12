define('xhr-bq-adaptor-js',
    
	['xhr-adaptor-js'],
    function (xhrAdaptorJs) {
    
	
	/**
	 * For the AMD module version of the library, the xhrBQJs namespace
	 * does not exist but refers instead to the AMD module itself.
	 *
	 * @summary The xhrAdaptorJs namespace and AMD module
	 * @version 1.0
	 * @exports xhr-bq-adaptor-js
	 * @namespace {object} xhrBQJs
	 */
	var xhrAdaptorJs = xhrAdaptorJs || {};

	//@@include('BlockingRequestQueueXHR.js')

    return xhrAdaptorJs;
});
