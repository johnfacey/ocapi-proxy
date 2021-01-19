# Salesforce Commerce Cloud OCAPI Proxy 
![version](https://img.shields.io/badge/Salesforce-OCAPIProxy-blue.svg)  ![version](https://img.shields.io/badge/version-1.2.0-green.svg)


[![NPM](https://nodei.co/npm/ocapi-proxy.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ocapi-proxy/)

This project will serve as a local NodeJS based Proxy server that will forward requests to an Salesforce Commerce Cloud OCAPI instance. 
This can be used for purposes such as testing 3rd party apps using OCAPI as well as integration for mobile/browser apps. 
The configuration of site_id, client_id are configured at the Proxy level rather than in the app directly. 

## Getting Started

Edit the config.json to match the server you are using. 
If you are using a service such as https://ngrok.com you may need to add the url to your Business Manager allowed origins.

**NOTE:** This package only forwards OCAPI requests from one point to another. The main purpose is for routing data around CORS and is typically useful for Mobile Applications. x-dw-client-id as a header attribute must be used instead of client_id as a url parameter.

## Updates
```
Errors will now return a json format if the SFCC instance can be reached. 
This will resolve issues with Postman not getting back a json result and aid in debugging. UI Testing interface added.
```
## Prerequisites
```
Required:
    NodeJS
    Salesforce Commerce Cloud Sandbox - Configured for OCAPI

Optional:
    Postman or another rest API tool.
    ngrok - If you need to get a public url to your localhost
```
## Installing
```
npm install ocapi-proxy
```

## Running 

From the command line: 
```
npm start or node ocapi-proxy.js


```

Example:
```
npm start ocapi-proxy.js
```
![Postman Example](./examples/pm2-example.png)

You will need a config.json (one will be generated on first launch)
To edit the port, domain, etc.. modify the config.json file. 
server: your SalesForce Commerce Cloud server (currently all calls are https)
site_id: SFCC Site ID
version: SFCC OCAPI Version
port_ui: Port for browser testing requests.
port: Port that proxy listens for requests.

Example:
```
{
    "server": "yoursandbox.demandware.net",
    "site_id": "SiteGenesis",
    "version": "v20_10",
    "client_id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "port": 8080,
    "port_ui": 80,
    "UA": "UA-XXXX-XXXX"  //This is optional can remove or leave blank.
};
```
## OCAPI Commands

You can send OCAPI commands to your local proxy. 
Specify the host to make the call.
Send the endpoint as the **callurl** header attribute.
All other attributes can be sent similar to a direct OCAPI call. 
This ensures that the Proxy communicates with OCAPI as middleware.

Example: 

![Postman Example](./examples/postman-example.png)

## Deployment/Development

This is currently a work in progress. Please report any issues you find.
Latest: Fixes to logging added dates to log files.
Updated contact info for [Github](https://github.com/johnfacey) and [Twitter](https://twitter.com/johnfacey).

## OCAPI Output Modifications

Currently **Authorization** and **ETag**  headers are returned into the body from the output proxy rather than in the header. These are not needed in 19.X+

## Universal Analytics

The Proxy will communicate with Google Universal Analytics if a "UA" attribute is found in the config file. You may leave this attribute blank or remove it from the config. Currently all UA requests are send as a event tag with the url of the Commerce Cloud Instance.

## Proxy Testing UI

![Postman Example](./examples/OCAPI-Proxy-Tester.png)

NEW Proxy UI for testing from a web brwoser interface. Config attribute "port_ui" added to config.json

## Files / Links
* [**Postman Collection**](./examples/OCAPI-Proxy.postman_collection.json)
* [**Example: config.json**](./sample-config.json)
```
## File Structure

Within the download you'll find the following directories and files:
|-- Root
    |-- .gitignore
    |-- .npmignore
    |-- build.js
    |-- config.json
    |-- ecosystem.config.js
    |-- libProxy.js
    |-- LICENSE.md
    |-- ocapi-proxy.js
    |-- package-lock.json
    |-- package.json
    |-- README.md
    |-- sample-config.json
    |-- SECURITY.md
    |-- .vscode
    |   |-- launch.json
    |-- examples
    |   |-- diagram-middleware.png
    |   |-- OCAPI-Proxy-Tester.png
    |   |-- OCAPI-Proxy.postman_collection.json
    |   |-- pm2-example.png
    |   |-- postman-example.png
    |-- html
    |   |-- index.html
    |-- logs

## Logging

The Proxy will generate logs where the current proxy has been executed in the logs directory.

## Built With

* [**NodeJS**](https://nodejs.org) 
* [**Express**](https://expressjs.com) - Minimalist Web Framework for NodeJS
* [**jsonfile**](https://www.npmjs.com/package/jsonfile) - read/write JSON files in NodeJS
* [**universal-analytics**](https://www.npmjs.com/package/universal-analytics) - Google Universal Analytics

## Authors

* **John Facey II** - *Lead*  
[![GitHub followers](https://img.shields.io/github/followers/johnfacey.svg?label=Follow&style=social)](https://github.com/johnfacey)
[![Twitter followers](https://img.shields.io/twitter/follow/johnfacey.svg?label=Follow&style=social)](https://twitter.com/johnfacey)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/M4M13CMPP)

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

See the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* [**Salesforce Commerce Cloud**](https://www.salesforce.com/products/commerce-cloud/overview)
* [**NodeJS**](https://nodejs.org) 
* [**Visual Studio Code**](https://code.visualstudio.com)
* [**ngrok**](https://ngrok.com)
* [**jQuery**](https://jQuery.com)
* [**Bootstrap**](https://getbootstrap.com)