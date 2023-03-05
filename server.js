"use strict";

const fs = require("fs");
const dispatcher = require("./dispatcher");
const http = require("http");
let header = { "Content-Type": "text/html;charset=utf-8" };
const jwt = require("jsonwebtoken");
const privateKey = fs.readFileSync("keys/private.key", "UTF8");
const mongo = require("mongodb");
const mongoClient = mongo.MongoClient;
const bcrypt = require("bcrypt");
const CONNECTION_STRING = "mongodb://127.0.0.1:27017";
const CONNECION_OPTIONS = { useNewUrlParser: true };

dispatcher.addListener("POST", "/api/registraUtente", function (req, res) {
  let mongoConnection = mongoClient.connect(CONNECTION_STRING);
  mongoConnection.catch((err) => {
    console.log(err);
    error(req, res, { code: 503, message: "Server Mongo Error" });
  });
  mongoConnection.then((client) => {
    let db = client.db("Cinema");
    let collection = db.collection("utenti");
    collection.insertOne(
      {
        _id: 1,
        username: "io",
      },
      function (err, data) {
        if (!err) {
          res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
          });
          res.end(JSON.stringify(data));
        } else {
          error(req, res, {
            code: 500,
            message: "Errore di esecuzione della query Mongo",
          });
        }
        client.close();
      }
    );
  });
});

function error(req, res, err) {
  res.writeHead(err.code, header);
  res.end(err.message);
}

/* Creazione del server */

http
  .createServer(function (req, res) {
    dispatcher.dispatch(req, res);
  })
  .listen(8888);
dispatcher.showList();
console.log("Server running on port 8888...");
