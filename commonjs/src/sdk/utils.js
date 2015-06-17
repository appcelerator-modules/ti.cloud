com.cocoafish.js.sdk.utils.getSessionParams = function() {
	var sessionParam = null;
	var sessionId = com.cocoafish.js.sdk.utils.getCookie(com.cocoafish.constants.sessionId);
	if (sessionId) {
		sessionParam = com.cocoafish.constants.sessionId + '=' + sessionId;
	}
	return sessionParam;
};

com.cocoafish.js.sdk.utils.cookieMap = [];
com.cocoafish.js.sdk.utils.cookieMap[com.cocoafish.constants.sessionId] = 'sessionId';
com.cocoafish.js.sdk.utils.cookieMap[com.cocoafish.constants.accessToken] = 'accessToken';
com.cocoafish.js.sdk.utils.cookieMap[com.cocoafish.constants.expiresIn] = 'expiresIn';
com.cocoafish.js.sdk.utils.securityManager = null;

com.cocoafish.js.sdk.utils.getCookie = function( name ) {
	var friendlyName = com.cocoafish.js.sdk.utils.cookieMap[name];
	return (friendlyName && Cloud[friendlyName]) || null;
};

com.cocoafish.js.sdk.utils.setCookie = function( name, value, expires, path, domain, secure ) {
	var friendlyName = com.cocoafish.js.sdk.utils.cookieMap[name];
	if (friendlyName) {
		if (value === '') {
			delete Cloud[friendlyName];
		} else {
			Cloud[friendlyName] = value;
		}
	}
};

com.cocoafish.js.sdk.utils.deleteCookie = function( name, path, domain ) {
	var friendlyName = com.cocoafish.js.sdk.utils.cookieMap[name];
	if (friendlyName) {
		delete Cloud[friendlyName];
	}
};

com.cocoafish.js.sdk.utils.getAuthType = function (obj) {
    if (obj) {
        if(obj.isThreeLegged()) {
            return com.cocoafish.constants.three_legged_oauth;
        } else if(obj.appKey) {
            return com.cocoafish.constants.app_key;
        } else if (obj.oauthKey && obj.oauthSecret) {
            return com.cocoafish.constants.oauth;
        }
    }
    return com.cocoafish.constants.unknown;
};

com.cocoafish.js.sdk.utils.getFileObject = function (data) {
    if (data) {
        for (var prop in data) {
            if (!data.hasOwnProperty(prop)) {
                continue;
            }
            if (prop == com.cocoafish.constants.photo || prop == com.cocoafish.constants.file) {
                return data[prop];
            }
        }
    }
    return null;
};

com.cocoafish.js.sdk.utils.cleanInvalidData = function (data) {
    if (data) {
        for (var prop in data) {
            if (!data.hasOwnProperty(prop)) {
                continue;
            }
            if (data[prop] == null) {
                delete data[prop];
            }
         // We need to stringify the data items passed in since ti.cloud allows the
         // caller to pass json objects in for the values rather than being restricted
         // to string values. Therefore we need to convert objects to strings here.
            if (typeof(data[prop]) == 'object') {
                // Check that we haven't received a blob or file.
             // [MOD-817] -- don't check for empty dictionary string "{}" of the stringified value
             if (prop == com.cocoafish.constants.photo || prop == com.cocoafish.constants.file) {
              continue;
             }
                // Otherwise, carry on with the stringification!
                data[prop] = JSON.stringify(data[prop]);
            }
            // If we receive a boolean, convert it to the equivalent integer. This helps Oauth behave itself.
            if (data[prop] === true || data[prop] === false) {
                data[prop] = data[prop] ? 1 : 0;
            }
        }
        return data;
    } else {
        return {};
    }
};

com.cocoafish.js.sdk.utils.uploadMessageCallback = function (event) {
    if (event && event.data) {
        return JSON.parse(event.data);
    } else {
        return {};
    }
};

com.cocoafish.js.sdk.utils.getOAuthParameters = function (parameters) {
    var urlParameters = '';
    if (parameters) {
        var list = OAuth.getParameterList(parameters);
        for (var p = 0; p < list.length; ++p) {
            var parameter = list[p];
            var name = parameter[0];
            if (name.indexOf("oauth_") == 0 && name != "oauth_token") {
                urlParameters += '&' + OAuth.percentEncode(name) + '=' + OAuth.percentEncode(parameter[1]);
            }
        }
    }
    if (urlParameters.length > 0) {
        urlParameters = urlParameters.substring(1);
    }
    return urlParameters;
};

com.cocoafish.js.sdk.utils.populateOAuthParameters = function (parameters, oauthKey) {
    if (parameters && oauthKey) {
        parameters.push(["oauth_version", "1.0"]);
        parameters.push(["oauth_consumer_key", oauthKey]);
        parameters.push(["oauth_signature_method", "HMAC-SHA1"]);
        parameters.push(["oauth_nonce", OAuth.nonce(15)]);
    }
};

com.cocoafish.js.sdk.utils.sendAppceleratorRequest = function (url, method, data, header, callback, sdk) {
    var xhr = Ti.Network.createHTTPClient({
        timeout: 60 * 1000,
        onsendstream: function (e) {
            Cloud.onsendstream && Cloud.onsendstream({
                url: url,
                progress: e.progress
            });
        },
        ondatastream: function (e) {
            Cloud.ondatastream && Cloud.ondatastream({
                url: url,
                progress: e.progress
            });
        },
        onerror: function (e) {
            var retVal = {};
            if(this.responseText) {
                var json = this.responseText;
                try {
                    json = json.trim();
                    if (json && json.length > 0) {
                        retVal = JSON.parse(json);
                    }
                } catch (err) {
                    retVal = err;
                }
        	}
            retVal.message || (retVal.message = e.error);
            retVal.error = true;
            retVal.statusText = this.statusText;
            retVal.status = this.status;
            if (retVal.meta) {
                retVal.metaString = JSON.stringify(retVal.meta);
            }
            callback(retVal);
        },
        onload: function () {
            var json = this.responseText;
            var data = JSON.parse(json);
            if (data && data.meta) {
                data.metaString = JSON.stringify(data.meta);
	            if(data.meta.session_id) {
		            var sessionId = data.meta.session_id;
	                com.cocoafish.js.sdk.utils.setCookie(com.cocoafish.constants.sessionId, sessionId);
		            sdk.session_id = sessionId;
	            }
            }
            callback(data);
        },
        securityManager: com.cocoafish.js.sdk.utils.securityManager
    });

    // for GET request only
    var requestURL = url;
    if ((method.toUpperCase() == com.cocoafish.constants.get_method) || (method.toUpperCase() == com.cocoafish.constants.delete_method)) {
        var params = '';
        for (var prop in data) {
            if (!data.hasOwnProperty(prop)) {
                continue;
            }
            params += '&' + prop + '=' + OAuth.percentEncode(data[prop]);
        }
        if (params.length > 0) {
            if (url.indexOf('?') > 0) {
                requestURL += params;
            } else {
                requestURL += '?' + params.substring(1);
            }
            data = {};
        }
    }

    if (Cloud.debug) {
        Ti.API.info(method + ': ' + requestURL);
        Ti.API.info('header: ' + JSON.stringify(header));
        Ti.API.info('data: ' + JSON.stringify(data));
    }

    // open the client
    xhr.open(method, requestURL);

    // set headers
	// MOD-831 -- MobileWeb does not support setting Accept-Encoding header
	if (Ti.Platform.osname != 'mobileweb') {
        xhr.setRequestHeader('Accept-Encoding', 'gzip,deflate');
	}
	// Do NOT remove these header settings on MobileWeb -- nothing will work if you do
    if (header) {
        for (var prop in header) {
            if (!header.hasOwnProperty(prop)) {
                continue;
            }
            xhr.setRequestHeader(prop, header[prop]);
        }
    }

    // send the data
    xhr.send(data);
};

/**
 * Decode a query string into a parameters object.
 *
 * @access private
 * @param   str {String} the query string
 * @return     {Object} the parameters to encode
 */
com.cocoafish.js.sdk.utils.decodeQS = function(str) {
    var
        decode = decodeURIComponent,
        params = {},
        parts  = str.split('&'),
        i,
        pair;

    for (i=0; i<parts.length; i++) {
        pair = parts[i].split('=', 2);
        if (pair && pair[0]) {
            params[decode(pair[0])] = decode(pair[1]);
        }
    }

    return params;
};


/**
 * Generates a weak random ID.
 *
 * @access private
 * @return {String} a random ID
 */
com.cocoafish.js.sdk.utils.guid = function() {
    return 'f' + (Math.random() * (1<<30)).toString(16).replace('.', '');
};

/**
 * Copies things from source into target.
 *
 * @access private
 * @param target    {Object}  the target object where things will be copied
 *                            into
 * @param source    {Object}  the source object where things will be copied
 *                            from
 * @param overwrite {Boolean} indicate if existing items should be
 *                            overwritten
 * @param tranform  {function} [Optional], transformation function for
 *        each item
 */
com.cocoafish.js.sdk.utils.copy = function(target, source, overwrite, transform) {
  for (var key in source) {
    if (overwrite || typeof target[key] === 'undefined') {
      target[key] = transform ? transform(source[key]) :  source[key];
    }
  }
  return target;
};

/**
 * Sets security manager to defend again man the middle attack
 *
 * @access private
 * @param securityManager {Object}  contains url and cert for validation
 *
 */
com.cocoafish.js.sdk.utils.setSecurityManager = function(securityManager) {
    com.cocoafish.js.sdk.utils.securityManager = securityManager;
};
