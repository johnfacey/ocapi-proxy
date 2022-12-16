
/**
 * OCAPI Proxy Constants 
 */
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const jsonfile = require('jsonfile');
const fs = require('fs');
const ua = require('universal-analytics');
const open = require('open');
const cors = require('cors');
const path = __dirname + '/html/';
const app = express();
const admin = express();

/**
 * OCAPI Proxy Variables 
 */
let server = "";
let site_id = "SiteGenesis";
let version = "v22_4";
let port = process.env.PORT || 8080;
let adminPort = "";
let UA = "";
let now = new Date();
let loadUI = false;
let logDate = now.getFullYear() + "-" + now.getDay() + "-" + now.getDate();
let message = "";
let logFileName = "./logs/ocapi-proxy-" + logDate + ".log";

try {
    fs.mkdirSync("./logs");
} catch (err) {
    console.log('Logs directory already exists');
}

writeLog = (logMessage) => {
    fs.appendFileSync(logFileName, logMessage + "\r\n", (err) => {
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
console.log(message);
writeLog(message);

readConfig = () => {
    try {
        if (fs.existsSync(file)) {
            //file exists --read file
            jsonfile.readFile(file, (err, obj) => {
                config = obj;
                if (config == undefined) { //file invalid
                    message = "Update the config.json or use sample-config.json";
                    console.log(message);
                    writeLog(message);
                    console.log("Exiting ocapi-proxy");
                    return false;
                } else {
                    port = process.env.PORT || config.port;
                    adminPort = config.port_ui || "";
                    site_id = config.site_id;
                    server = config.server;
                    version = config.version;
                    client_id = config.client_id;
                    if (config.UA != undefined && config.UA != "") {
                        UA = config.UA;
                    }

                    app.listen(port, () => {
                        return console.log('OCAPI Proxy Port: ' + port);
                    });

                    if (adminPort != "") {
                        admin.listen(adminPort, () => {
                            var adminHost = 'http://localhost:'+adminPort;
                            var message = "OCAPI UI: " + adminHost;
                            writeLog(message);
                            console.log(message);
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

writeConfig = () => {

    var obj = {
        "server": "yoursandbox.demandware.net",
        "site_id": "SiteGenesis",
        "version": "v22_10",
        "client_id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "port": port,
        "port_ui": adminPort,
        "UA": ""
    };
    jsonfile.writeFile(file, obj, (err) => {
        if (err != null) {
            console.log(err);
            writeLog(err);
        }
    });
    message = "Creating config.json";
    console.log(message);
    writeLog(message);
};


 callbackAdmin = (error, response, body) => {
    response.send("Test Callback");
}

AdminCall = (req, resp) => {
    var adminRequest = req;
    var adminResponse = resp;
    var options = {
        method: req.method,
        body: adminRequest.body
    };
    request(options, callbackAdmin);
}

ProxyCall = (req, resp) => {
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

    request(options, callback);
    if (UA != "") {

        try {
            var visitor = ua(UA); //UA-XXXX-XX
            visitor.event("OCAPI", callurl).send();

        } catch (err) {
            console.log(err);
            writeLog(err);
        }
    }


    callback = (error, response, body) => {
        try {
            if (!error && response.statusCode == 200) {
                writeLog(body);
                console.log(chalk.green(body));
            } else {
                //error
                console.log(chalk.red("Check Config/Ports - " + error.code + ":" + error.message));
                writeLog("Check Config/Ports - " + error.code + ":" + error.message);
                jsonError = {
                    "code": error.code,
                    "message": error.message,
                    "timestamp": new Date().getTime()
                }
                jsonError = JSON.stringify(jsonError);
                proxyResponse.send(jsonError);
                return;
            }

            writeLog(body);
            console.log(body);
            var jsonBody = JSON.parse(body);

            if (response.headers.hasOwnProperty("authorization")) {
                jsonBody.Authorization = response.headers.authorization;
            }

            if (response.headers.hasOwnProperty("etag")) {
                jsonBody.ETag = response.headers.etag;
            }
            jsonBody = JSON.stringify(jsonBody);
            proxyResponse.send(jsonBody);

        } catch (err) {
            console.log(err);
            writeLog(err);
        }

    }
}

exports.start = () => {

    var configFileValid = readConfig();
    if (configFileValid) {

    } else {
        //process.exit();
    }

    var jsonParser = bodyParser.json();

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(cors());
    admin.use(cors());

    app.all('/', jsonParser,  (request, response) => {

        response.setHeader('Content-Type', "application/json");
        response.setHeader("Access-Control-Allow-Origin", "*");

        var headers = JSON.stringify(request.headers);
        var requestBody = request.body;

        ProxyCall(request, response);

    });

    admin.use(bodyParser.urlencoded({
        extended: true
    }));
  
    app.use(express.static(__dirname + '/html'));

    admin.all('/', (request, response) => {

        response.setHeader('Content-Type', "text/html");
        var headers = JSON.stringify(request.headers);
        var requestBody = request.body;
        
        response.sendFile(path + "index.html");
    });
   
    if (process.argv.slice(2) != null && process.argv.slice(2) != undefined) {
        if (process.argv.slice(2) == "loadUI") {
            loadUI = true;
        }
    }

};
