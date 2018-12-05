var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');
var fs = require('fs');
var winston = require('winston');

var app = express();
var server = "";
var site_id = "SiteGenesis";
var version = "v18_8";
var port = 8080;

var file = './config.json';

fs.mkdirSync("./logs");

var logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: './logs/ocapi-proxy.log'
        })
    ]
});

readConfig = function () {
    try {
        if (fs.existsSync(file)) {
            //file exists --read file
            jsonfile.readFile(file, function (err, obj) {
                config = obj;
                if (config == undefined) { //file invalid
                    console.log("Update the config.json or use sample-config.json");
                    logger.info("Update the config.json or use sample-config.json");
                    return false;
                } else {
                    port = config.port;
                    site_id = config.site_id;
                    server = config.server;
                    version = config.version;
                    client_id = config.client_id;
                    app.listen(port, () => console.log('OCAPI Proxy listening on port: ' + port));
                    return true;
                }
            });
        } else {
            writeConfig();
        }
    } catch (err) {
        console.error(err);
        logger.err(err);
        writeConfig();
    }

};

/**
 * Currently unsed
 */
writeConfig = function () {
    var obj = {
        "server": "yoursandbox.demandware.net",
        "site_id": "SiteGenesis",
        "version": "v18_8",
        "client_id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "port": 8080
    };
    jsonfile.writeFile(file, obj, function (err) {
        if (err != null) {
            console.error(err);
            logger.error(err);
        }
    });

    console.log("Creating config.json");
    logger.info("Creating config.json");
};

function ProxyCall(req, resp) {
    var proxyRequest = req;
    var proxyResponse = resp;
    var callurl = "https://" + server + "/s/" + site_id + "/dw/shop/" + version + "/" + proxyRequest.headers.callurl;
    var options = {
        url: callurl, //proxyRequest.headers.callurl,
        method: req.method,
        headers: {
            'callurl': proxyRequest.headers.callurl
        },
        body: JSON.stringify(proxyRequest.body)
    };

    /*if (proxyRequest.headers.hasOwnProperty("header-copy")) {

        for (var propt in proxyRequest.headers) {
            if (propt != "host") {
                options.headers[propt] = proxyRequest.headers[propt];
            }
        }
    */
    // } else {

    options.headers["x-dw-client-id"] = client_id;

    if (proxyRequest.headers.hasOwnProperty("x-dw-http-method-override")) {
        options.headers["x-dw-http-method-override"] = proxyRequest.headers["x-dw-http-method-override"];
    }
    if (proxyRequest.headers.hasOwnProperty("user-agent")) {
        options.headers["user-agent"] = proxyRequest.headers["user-agent"];
    }


    if (proxyRequest.headers.hasOwnProperty("authorization")) {
        options.headers.Authorization = proxyRequest.headers.authorization;
    }

    if (proxyRequest.headers.hasOwnProperty("etag")) {
        options.headers.ETag = proxyRequest.headers.etag;
    }
    //}

    function callback(error, response, body) {
        try {
            if (!error && response.statusCode == 200) {}

            logger.info(body);
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

        } catch (err) {
            console.log(err);
            logger.error(err);
        }

        request(options, callback);

    }
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