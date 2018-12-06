# Salesforce Commerce Cloud OCAPI Proxy 

![](https://img.shields.io/badge/Salesforce-OCAPIProxy-blue.svg)  

![](https://img.shields.io/badge/Version-1.0.2-green.svg)

This project will serve as a local NodeJS based Proxy server that will forward requests to an Salesforce Commerce Cloud OCAPI instance. This can be used for purposes such as testing 3rd party apps using OCAPI as well as integration for mobile/browser apps. The configuration of site_id, client_id etc... are configured at the Proxy level rather than in the app directly. Coresponding Mobile App: {future link}

## Getting Started

These Setup the config.json to match the server you are using. 
If you are using a a service such as https://ngrok.com you may need to add the url to your Business Manager allowed origins.
**NOTE:** This package only forwards OCAPI requests from one point to another. The main purpose is for routing data around CORS and is typically useful for Mobile Applications.

## Prerequisites
```
NodeJS
Express
Salesforce Commerce Cloud Sandbox - Configured for OCAPI
ngrok - If you need to get a public url to your localhost
```
## Installing
```
npm install ocapi-proxy
```

## Running 

From the command line: 
```
npm start or node index.js
```

You will need a config.json (one will be generated on first launch)
To edit the port, domain, etc.. modify the config.json file. 
server: your Salesforce Commcerce Cloud server (no protocal)
site_id: SFCC Site ID
version: SFCC OCAPI Version
port: Port that proxy listens for requests.

Example:
```
{
    "server": "yoursandbox.demandware.net",
    "site_id": "SiteGenesis",
    "version": "v18_8",
    "client_id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "port": 8080
};
```
## OCAPI Commands

You can send OCAPI commands to your local proxy. 
Specify the host to make the call.
Send the endpoint as the callurl header attribute.
All other attributes can be sent like a direct OCAPI call. 
This ensures that the Proxy communicates with OCAPI as middleware.

Example: 

![Postman Example](./examples/postman-example.png)

## Deployment/Development

This is currently a work in progress. Please report any issues you find.
Updated contact info for Github and Twitter.

## OCAPI Output Modifications

Currently **Authorization** and **ETag**  headers are returned into the body from the output proxy rather than in the header.

## Logging

The Proxy will generate logs where the current proxy has been executed.

## Built With

* [NodeJS](https://nodejs.org) 
* [Express](https://expressjs.com) - Minimalist Web Framework for NodeJS
* [Winston](https://www.npmjs.com/package/winston) - A logger for just about everything.

## Authors

* **John Facey II** - *Initial work*  
[![GitHub followers](https://img.shields.io/github/followers/johnfacey.svg?label=Follow&style=social)](https://github.com/johnfacey)
![https://twitter.com/johnfacey](https://img.shields.io/twitter/follow/johnfacey.svg?label=Follow&style=social)

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

See the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* **NodeJS** - (https://nodejs.org)
* **Visual Studio Code** - (https://code.visualstudio.com/)
* **ngrok** - (https://ngrok.com)