(function() {
	var xhrTestUtils = xhrTestUtils || {};


	xhrTestUtils.isActiveXObjectSupported = function() {
		try {
			var dummy = {} instanceof ActiveXObject;
		} catch (e) {
			return false;
		}
		return true;
	};

	xhrTestUtils.createNativeXhr = function() {
		// Always test the ActiveX xhr on IE
		return xhrTestUtils.isActiveXObjectSupported() ?
			new ActiveXObject('MSXML2.XMLHTTP.3.0') :
			new window.XMLHttpRequest();
	};

	define('xhrTestUtils',
		[],
		function () {
			return xhrTestUtils;
		}
	);

})();