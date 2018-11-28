var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');

var app = express();
var port = 8080;

var file = './config.json';

readConfig = function () {
    jsonfile.readFile(file, function (err, obj) {
        config = obj;
        if (config == undefined) {
            console.log("Update the config.json or use sample.json");
            return false;
        } else {
            port = config.port;
            app.listen(port, () => console.log('OCAPI Proxy listening on port: ' + port));
            return true;
        }
    });
};

/**
 * Currently unsed
 */
writeConfig = function () {
    var obj = {
        //sandbox: sandbox,
        //username: username,
        //password: password,
    };
    jsonfile.writeFile(file, obj, function (err) {
        console.error(err);
    });
};

function ProxyCall(req, resp) {
    var proxyRequest = req;
    var proxyResponse = resp;
    var options = {
        url: proxyRequest.headers.callurl,
        method: req.method,
        headers: {
            'callurl': proxyRequest.headers.callurl
        },
        body: JSON.stringify(proxyRequest.body)
    };

    if (proxyRequest.headers.hasOwnProperty("header-copy")) {

        for (var propt in proxyRequest.headers) {
            if (propt != "host") {
                options.headers[propt] = proxyRequest.headers[propt];
            }
        }

    } else {

        if (proxyRequest.headers.hasOwnProperty("user-agent")) {
            options.headers["user-agent"] = proxyRequest.headers["user-agent"];
        }

        if (proxyRequest.headers.hasOwnProperty("x-dw-client-id")) {
            options.headers["x-dw-client-id"] = proxyRequest.headers["x-dw-client-id"];
        }

        if (proxyRequest.headers.hasOwnProperty("authorization")) {
            options.headers.Authorization = proxyRequest.headers.authorization;
        }

        if (proxyRequest.headers.hasOwnProperty("etag")) {
            options.headers.ETag = proxyRequest.headers.etag;
        }
    }

    function callback(error, response, body) {

        if (!error && response.statusCode == 200) {}

        var jsonBody = JSON.parse(body);

        if (response.headers.hasOwnProperty("authorization")) {
            jsonBody.Authorization = response.headers.authorization;
        }

        if (response.headers.hasOwnProperty("etag")) {
            jsonBody.ETag = response.headers.etag;
        }
        jsonBody = JSON.stringify(jsonBody);

        console.log(jsonBody);
        proxyResponse.send(jsonBody);

    }

    request(options, callback);

}

exports.start = function () {
    
    var configFileValid = readConfig();
    if (configFileValid) {

    } else {
        //process.exit();
    }
    
    var jsonParser = bodyParser.json();

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    app.all('/', jsonParser, function (request, response) {

        response.setHeader('Content-Type', "application/json");
        var headers = JSON.stringify(request.headers);
        var requestBody = request.body;

        ProxyCall(request, response);

    });

   // app.listen(port, () => console.log('OCAPI Proxy listening on port: ' + port));

};