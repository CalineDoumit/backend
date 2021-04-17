// An excellent explanation of the CORS protocol:
// https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

const express = require('express');
const cors = require('cors'); // see https://www.npmjs.com/package/cors
const app = express();

// add the address of the React or Angular client to the whitelist, example: 'http://localhost:3001'
const whitelist = ['http://localhost:3000','https://localhost:3443', 'http://localhost:3001','http://localhost:19006'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    console.log(req.header('Origin'));
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true,
            optionsSuccessStatus: 200 ,// For legacy browser support
            methods: "GET, PUT, POST" };
    }
    else {
        corsOptions = { origin: false,
            optionsSuccessStatus: 200 ,// For legacy browser support
            methods: "GET, PUT, POST" };
    }
    callback(null, corsOptions);
};




exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);