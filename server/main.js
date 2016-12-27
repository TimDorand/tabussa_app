import { Meteor } from 'meteor/meteor';
import { JsonRoutes } from 'meteor/simple:json-routes';
import { WebApp } from 'meteor/webapp';
import { HTTP } from 'meteor/cfs:http-methods';
// import  cors  from 'cors';



Meteor.startup(() => {

    /**
     * HTTP Header Security
     *
     * enforce HTTP Strict Transport Security (HSTS) to prevent ManInTheMiddle-attacks
     * on supported browsers (all but IE)
     * > http://www.html5rocks.com/en/tutorials/security/transport-layer-security
     *
     * @header Strict-Transport-Security: max-age=2592000; includeSubDomains
     */

// attach connect-style middleware for response header injection
    WebApp.rawConnectHandlers.use(function (req, res, next) {
            res.setHeader('Strict-Transport-Security', 'max-age=2592000; includeSubDomains'); // 2592000s / 30 days
            return next();
    });



// Enable cross origin requests for all endpoints
    JsonRoutes.setResponseHeaders({
        "Cache-Control": "no-store",
        "Pragma": "no-cache",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
    });

    /*
    WebApp.rawConnectHandlers.use(function(req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        return next();
    });*/


});
