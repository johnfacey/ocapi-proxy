var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');
var fs = require('fs');
var chalk = require("chalk");
var ua = require('universal-analytics');

var app = express();
var server = "";
var site_id = "SiteGenesis";
var version = "v20_10";
var port = 8080;

var UA = "";
var now = new Date();

var logDate = now.getFullYear() + "-" + now.getDay() + "-" + now.getDate();

var message = "";
var logFileName = "./logs/ocapi-proxy-" + logDate + ".log";
try {
    fs.mkdirSync("./logs");
} catch (err) {
    console.log(chalk.red('Logs directory already exists'));
}

writeLog = function (logMessage) {
    fs.appendFileSync(logFileName, logMessage + "\r\n", function (err) {
        if (err) throw err;

    });
};

var file = './config.json';
try {
    if (process.argv[2]) {
        file = process.argv[2];
    }
} catch (err) {
    file = './config.json';
}

message = "Loading config file: " + file;
console.log(chalk.blue(message));
writeLog(message);

//writeLog(l);


readConfig = function () {
    try {
        if (fs.existsSync(file)) {
            //file exists --read file
            jsonfile.readFile(file, function (err, obj) {
                config = obj;
                if (config == undefined) { //file invalid
                    message = "Update the config.json or use sample-config.json";
                    console.log(chalk.blue(message));
                    writeLog(message);
                    return false;
                } else {
                    port = config.port;
                    site_id = config.site_id;
                    server = config.server;
                    version = config.version;
                    client_id = config.client_id;
                    if (config.UA != undefined && config.UA != "") {
                        UA = config.UA;
                    }

                    try {
                        app.listen(port, () => {
                            return console.log(chalk.blue('OCAPI Proxy listening on port: ' + port));
                        });
                    } catch(err) {
                        app.listen(process.env.PORT, () => {
                            return console.log(chalk.blue('OCAPI Proxy listening on port: ' + process.env.PORT));
                        });
                    }
                    return true;
                }
            });
        } else {
            writeConfig();
        }
    } catch (err) {
        console.log(err);
        writeLog(err);
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
        "version": "v20_3",
        "client_id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "port": 8080,
        "UA": ""
    };
    jsonfile.writeFile(file, obj, function (err) {
        if (err != null) {
            console.log(chalk.red(err));
            writeLog(err);
        }
    });
    message = "Creating config.json";
    console.log(chalk.blue(message));
    writeLog(message);
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

    request(options, callback);
    if (UA != "") {

        try {
            var visitor = ua(UA); //UA-XXXX-XX
            visitor.event("OCAPI", callurl).send();

        } catch (err) {
            console.log(chalk.red(err));
            writeLog(err);
        }
    }

    function callback(error, response, body) {
        try {
            if (!error && response.statusCode == 200) {}

            writeLog(body);
            console.log(chalk.green(body));
            var jsonBody = JSON.parse(body);

            if (response.headers.hasOwnProperty("authorization")) {
                jsonBody.Authorization = response.headers.authorization;
            }

            if (response.headers.hasOwnProperty("etag")) {
                jsonBody.ETag = response.headers.etag;
            }
            jsonBody = JSON.stringify(jsonBody);

            //console.log(jsonBody);
            proxyResponse.send(jsonBody);

        } catch (err) {
            console.log(chalk.red(err));
            writeLog(err);
        }

        // request(options, callback);

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