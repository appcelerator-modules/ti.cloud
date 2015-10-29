/**
 * Throws an exception if an argument has not been provided, or is not of the expected type.
 * @param name The string display name of the argument (such as 'data')
 * @param arg The actual provided argument
 * @param type The string value of the expected argument type (such as 'object' or 'string').
 */
function requireArgument(name, arg, type) {
    if (arg === undefined) {
        throw 'Argument ' + name + ' was not provided!';
    }
    if (typeof(arg) != type) {
        throw 'Argument ' + name + ' was an unexpected type! Expected: ' + type + ', Received: ' + typeof(arg);
    }
}

function baseExecutor(url, verb, data, callback) {
    if (Cloud.debug) {
        Ti.API.info('ACS Request: { ' +
            'url: "' + url + '", ' +
            'verb: "' + verb + '", ' +
            'data: ' + JSON.stringify(data) + ' ' +
            '})');
    }
    ACS.send(url, verb, data,
        function handleResponse(evt) {
            if (!callback) {
                return;
            }
            var response = evt.response || {};
            if (evt.meta && evt.meta.status == 'ok') {
                response.success = true;
                response.error = false;
                response.meta = evt.meta;
                if (Cloud.debug) {
                    Ti.API.info(JSON.stringify(response));
                }
            }
            else {
                response.success = false;
                response.error = true;
                response.code = evt.meta ? evt.meta.code : evt.statusCode;
                response.message = evt.meta ? evt.meta.message : (evt.message || evt.statusText);
                if (Cloud.debug) {
                    Ti.API.error(response.code + ': ' + response.message);
                }
            }
            callback(response);
        }
    );
}

function genericExecutor(params, callback) {
    requireArgument('params', params, 'object');
    requireArgument('url', params.url, 'string');
    requireArgument('method', params.method, 'string');
    requireArgument('callback', callback, 'function');

    var data = params.data ? params.data : {};
    baseExecutor(params.url, params.method, data, callback);
}

/**
 * Calls the ACS REST API with the provided data, executing the provided callback when we get a response.
 * @param data
 * @param callback
 */
function defaultExecutor(data, callback) {
    requireArgument('data', data, 'object');
    requireArgument('callback', callback, 'function');
    propagateRestNames(this);
    if (!this.url) {
        this.url = this.restNamespace + '/' + this.restMethod + '.json';
    }
    baseExecutor(this.url, this.verb, data, callback);
}

function dataOptionalExecutor() {
    defaultExecutor.call(this,
        arguments.length == 2 ? arguments[0] : {},
        arguments.length == 2 ? arguments[1] : arguments[0]
    );
}

function dataExcludedExecutor(callback) {
    defaultExecutor.call(this, {}, callback);
}

function classnameRequiredExecutor(data, callback) {
    var savedClassName;
    if (data && typeof(data) == 'object') {
        requireArgument('data.classname', data.classname, 'string');
        propagateRestNames(this);
        this.url = this.restNamespace + '/' + data.classname + '/' + this.restMethod + '.json';
        // We don't want the class name passed as a variable, so delete it from data.
        savedClassName = data.classname;
        delete data.classname;
    }
    defaultExecutor.call(this, data, callback);
    // Now restore it to the data object so that we don't corrupt the object for subsequent calls.
    data.classname = savedClassName;
}

function propagateRestNames(context) {
    if (!context.restNamespace) {
        context.restNamespace = context.property.toLowerCase();
    }
    if (!context.restMethod) {
        context.restMethod = context.method.toLowerCase();
    }
}

function hasStoredSession() {
    Ti.API.warn("Cloud.hasStoredSession has been deprecated. Use Cloud.sessionId property");
    return ACS.hasStoredSession();
}

function retrieveStoredSession() {
    Ti.API.warn("Cloud.retrieveStoredSession has been deprecated. Use Cloud.sessionId property");
    return ACS.retrieveStoredSession();
}

//load the certificate for validation on https. only available if https module exists
function createX509CertificatePinningSecurityManager(data) {
    var httpsModuleExists = true;
    try{
       var https = require('appcelerator.https');    
    }catch(e){
        Ti.API.error(e + ' SecurityManager not set.');
        httpsModuleExists = false;
    }
    if (httpsModuleExists) {
        // Use the module to create a Security Manager that authenticates the specified URLs
        var securityManager = https.createX509CertificatePinningSecurityManager(data);
        com.cocoafish.js.sdk.utils.setSecurityManager(securityManager);
    }

};
function secureAuthExecutor(data, callback) {
    requireArgument('callback', callback, 'function');

    var options = {};
    options.params = data || {};
    options.params.cb = function handleResponse(evt) {
        if (!callback) {
            return;
        }
        var response = evt || {};
        if (evt && evt.access_token) {
            response.success = true;
            response.error = false;
            if (Cloud.debug) {
                Ti.API.info("ACS Token: " + evt.access_token + " Expires: " + evt.expires_in);
            }
        } else {
            response.success = false;
            response.error = true;
            response.message = "Cancelled";
            if (Cloud.debug) {
                Ti.API.error("ACS " + response.message);
            }
        }
        callback(response);
    };

    ACS.secureSend(this.method, options);
}

function dataOptionalSecureAuthExecutor() {
    secureAuthExecutor.call(this,
        arguments.length == 2 ? arguments[0] : {},
        arguments.length == 2 ? arguments[1] : arguments[0]
    );
}

function dataExcludedResetSessionExecutor(callback) {
    defaultExecutor.call(this, {}, function (evt) {
        ACS.reset();
        callback(evt);
    });
}

function dataOptionalResetSessionExecutor() {
    var orig = arguments;
    defaultExecutor.call(this,
        orig.length == 2 ? orig[0] : {},
        function (evt) {
            ACS.reset();
            (orig.length == 2 ? orig[1] : orig[0])(evt);
        }
    );
}

function checkStatus() {
    return ACS.checkStatus();
}

BedFrame.build(Cloud, {
    verb: 'GET',
    executor: defaultExecutor,
    children: [
        // Top level methods not associated with a namespace
        { method: 'sendRequest', executor: genericExecutor },
        { method: 'createX509CertificatePinningSecurityManager', executor: createX509CertificatePinningSecurityManager },
        { method: 'hasStoredSession', executor: hasStoredSession },
        { method: 'retrieveStoredSession', executor: retrieveStoredSession },
        {
            property: 'ACLs',
            children: [
                { method: 'create', verb: 'POST' },
                { method: 'update',  verb: 'PUT' },
                { method: 'show' },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE' },
                { method: 'addUser', restMethod: 'add', verb: 'POST' },
                { method: 'removeUser', restMethod: 'remove', verb: 'DELETE' },
                { method: 'checkUser', restMethod: 'check' }
            ]
        },
        {
            property: 'Chats',
            children: [
                { method: 'create', verb: 'POST' },
                { method: 'query' },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE'},
                { method: 'queryChatGroups', restMethod: 'query_chat_groups', executor: dataOptionalExecutor },
                { method: 'getChatGroups', restMethod: 'get_chat_groups', executor: dataOptionalExecutor }
            ]
        },
        {
            property: 'Checkins',
            children: [
                { method: 'create', verb: 'POST' },
                { method: 'query', executor: dataOptionalExecutor },
                { method: 'show' },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE' }
            ]
        },
        {
            property: 'Clients',
            children: [
                { method: 'geolocate', executor: dataOptionalExecutor }
            ]
        },
        {
            property: 'Objects',
            executor: classnameRequiredExecutor,
            children: [
                { method: 'create', verb: 'POST' },
                { method: 'show' },
                { method: 'update', verb: 'PUT' },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE' },
                { method: 'query' }
            ]
        },
        {
            property: 'Emails',
            restNamespace: 'custom_mailer',
            children: [
                { method: 'send', verb: 'POST', restMethod: 'email_from_template' }
            ]
        },
        {
            property: 'Events',
            children: [
                { method: 'create', verb: 'POST' },
                { method: 'show' },
                { method: 'showOccurrences', restMethod: 'show/occurrences' },
                { method: 'query', executor: dataOptionalExecutor },
                { method: 'queryOccurrences', restMethod: 'query/occurrences', executor: dataOptionalExecutor },
                { method: 'search', executor: dataOptionalExecutor},
                { method: 'searchOccurrences', restMethod: 'search/occurrences', executor: dataOptionalExecutor },
                { method: 'update', verb: 'PUT' },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE' }
            ]
        },
        {
            property: 'Files',
            children: [
                { method: 'create', verb: 'POST' },
                { method: 'query', executor: dataOptionalExecutor },
                { method: 'show' },
                { method: 'update', verb: 'PUT' },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE' }
            ]
        },
        {
            property: "Friends",
            children: [
                { method: 'add', verb: 'POST' },
                { method: 'requests', executor: dataOptionalExecutor },
                { method: 'approve', verb: 'PUT'},
                { method: 'remove', verb: 'DELETE'},
                { method: 'search' }
            ]
        },
        {
            property: "GeoFences",
            restNamespace: 'geo_fences',
            children: [
                { method: 'create', verb: 'POST' },
                { method: 'update', verb: 'PUT'},
                { method: 'remove', restMethod: 'delete', verb: 'DELETE'},
                { method: 'query' }
            ]
        },
        {
            property: 'KeyValues',
            children: [
                { method: 'set', verb: 'PUT' },
                { method: 'get' },
                { method: 'append', verb: 'PUT' },
                { method: 'increment', restMethod: 'incrby', verb: 'PUT' },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE' }
            ]
        },
        {
            property: 'Likes',
            children: [
                { method: 'create', verb: 'POST' },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE' }
            ]
        },
        {
            property: 'Messages',
            children: [
                { method: 'create', verb: 'POST' },
                { method: 'reply', verb: 'POST' },
                { method: 'show' },
                { method: 'showInbox', restMethod: 'show/inbox', executor: dataOptionalExecutor },
                { method: 'showSent', restMethod: 'show/sent', executor: dataOptionalExecutor },
                { method: 'showThreads', restMethod: 'show/threads', executor: dataOptionalExecutor },
                { method: 'showThread', restMethod: 'show/thread' },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE' },
                { method: 'removeThread', restMethod: 'delete/thread', verb: 'DELETE' }
            ]
        },
        {
            property: 'Photos',
            children: [
                { method: 'create', verb: 'POST' },
                { method: 'show' },
                { method: 'search' },
                { method: 'query', executor: dataOptionalExecutor },
                { method: 'update', verb: 'PUT' },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE' }
            ]
        },
        {
            property: 'PhotoCollections',
            restNamespace: 'collections',
            children: [
                { method: 'create', verb: 'POST' },
                { method: 'show' },
                { method: 'update', verb: 'PUT' },
                { method: 'search' },
                { method: 'showSubcollections', restMethod: 'show/subcollections' },
                { method: 'showPhotos', restMethod: 'show/photos' },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE' }
            ]
        },
        {
            property: 'Places',
            children: [
                { method: 'create', verb: 'POST' },
                { method: 'search', executor: dataOptionalExecutor },
                { method: 'show' },
                { method: 'update', verb: 'PUT' },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE' },
                { method: 'query', executor: dataOptionalExecutor }
            ]
        },
        {
            property: 'Posts',
            children: [
                { method: 'create', verb: 'POST' },
                { method: 'show' },
                { method: 'query', executor: dataOptionalExecutor },
                { method: 'update', verb: 'PUT' },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE' }
            ]
        },
        {
            property: 'PushNotifications',
            restNamespace: 'push_notification',
            verb: 'POST',
            children: [
                { method: 'subscribe' },
                { method: 'unsubscribe', verb: 'DELETE' },
                { method: 'notify' },
                { method: 'query', verb: 'GET' },
                { method: 'subscribeToken', restMethod: 'subscribe_token' },
                { method: 'unsubscribeToken', restMethod: 'unsubscribe_token', verb: 'DELETE' },
                { method: 'updateSubscription', restMethod: 'subscription/update', verb: 'PUT' },
                { method: 'notifyTokens', restMethod: 'notify_tokens' },
                { method: 'resetBadge', restMethod: 'reset_badge', verb: 'PUT' },
                { method: 'setBadge', restMethod: 'set_badge', verb: 'PUT', executor: dataOptionalExecutor },
                { method: 'queryChannels', restMethod: 'channels/query', verb: 'GET', executor: dataOptionalExecutor },
                { method: 'showChannels', restMethod: 'channels/show', verb: 'GET' }
            ]
        },
        {
            property: 'PushSchedules',
            restNamespace: 'push_schedules',
            children: [
                { method: 'create', restMethod: 'create', verb: 'POST' },
                { method: 'query', restMethod: 'query', executor: dataOptionalExecutor },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE' }
            ]
        },
        {
            property: 'Reviews',
            children: [
                { method: 'create', verb: 'POST' },
                { method: 'show' },
                { method: 'query' },
                { method: 'update', verb: 'PUT' },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE' }
            ]
        },
        {
            property: 'SocialIntegrations',
            restNamespace: 'users',
            children: [
                { method: 'externalAccountLogin', restMethod: 'external_account_login', verb: 'POST' },
                { method: 'externalAccountLink', restMethod: 'external_account_link', verb: 'POST' },
                { method: 'externalAccountUnlink', restMethod: 'external_account_unlink', verb: 'DELETE' },
                { method: 'searchFacebookFriends', restNamespace: 'social', restMethod: 'facebook/search_friends',
                    executor: dataOptionalExecutor
                }
            ]
        },
        {
            property: 'Statuses',
            children: [
                { method: 'create', verb: 'POST' },
                { method: 'update', verb: 'PUT' },
                { method: 'show' },
                { method: 'search' },
                { method: 'query', executor: dataOptionalExecutor },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE' }
            ]
        },
        {
            property: 'Users',
            children: [
                { method: 'create', verb: 'POST' },
                { method: 'login', verb: 'POST' },
                { method: 'show' },
                { method: 'showMe', restMethod: 'show/me', executor: dataExcludedExecutor },
                { method: 'search', executor: dataOptionalExecutor },
                { method: 'query', executor: dataOptionalExecutor },
                { method: 'update', verb: 'PUT' },
                { method: 'logout', executor: dataOptionalResetSessionExecutor },
                { method: 'remove', restMethod: 'delete', verb: 'DELETE', executor: dataOptionalResetSessionExecutor },
                { method: 'requestResetPassword', restMethod: 'request_reset_password' },
                { method: 'resendConfirmation', restMethod: 'resend_confirmation' }
                // { method: 'secureCreate', executor: dataOptionalSecureAuthExecutor },
                // { method: 'secureLogin', executor: dataOptionalSecureAuthExecutor },
                // { method: 'secureStatus', executor: checkStatus }
            ]
        }
    ]
});
