"use strict";

const fs=require("fs");
const dispatcher=require("./dispatcher");
const http=require("http");
let header={"Content-Type":"text/html;charset=utf-8"};
const jwt=require("jsonwebtoken");
const privateKey=fs.readFileSync("keys/private.key","UTF8");
const mongo=require("mongodb");
const mongoClient=mongo.MongoClient;
const bcrypt = require("bcrypt");
const CONNECTION_STRING="mongodb://127.0.0.1:27017";
const CONNECION_OPTIONS={ useNewUrlParser:true };


function error(req,res,err){
    res.writeHead(err.code,header);
    res.end(err.message);
}

/* Creazione del server */

http.createServer(function (req,res){
    dispatcher.dispatch(req,res);
}).listen(8888);
dispatcher.showList();
console.log("Server running on port 8888...");