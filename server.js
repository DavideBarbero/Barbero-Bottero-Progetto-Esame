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
const tokenAdministration = require("./tokenAdministration");
const { readCookie, payload } = require("./tokenAdministration");

//Nuovo id in automatico
/*dispatcher.addListener("GET", "/api/idNuovoUtente", function (req, res) {
  let mongoConnection = mongoClient.connect(CONNECTION_STRING);
  mongoConnection.catch((err) => {
    console.log(err);
    error(req, res, { code: 503, message: "Server Mongo Error" });
  });
  mongoConnection.then((client) => {
    let db = client.db("Cinema");
    let collection = db.collection("utenti");
    collection
      .aggregate([{ $sort: { _id: -1 } }, { $limit: 1 }])
      .toArray(function (errQ, data) {
        if (errQ)
          error(req, res, {
            code: 500,
            message: "Errore durante l'esecuzione della query Mongo",
          });
        else {
          res.writeHead(200, headerJSON);
          res.end(JSON.stringify(data));
        }
        client.close();
      });
  });
});*/

//Registrazione
dispatcher.addListener("POST", "/api/registraUtente", function (req, res) {
  let mongoConnection = mongoClient.connect(CONNECTION_STRING);
  mongoConnection.catch((err) => {
    console.log(err);
    error(req, res, { code: 503, message: "Server Mongo Error" });
  });
  mongoConnection.then((client) => {
    let db = client.db("Cinema");
    let collection = db.collection("utenti");
    let par = req["post"];
    let _id = parseInt(par["id"]);
    let nome = par["nome"];
    let cogn = par["cogn"];
    let datanascita = par["data"];
    let email = par["email"];
    let pwd = par["pwd"];
    //let pwdCrypted = bcrypt.hashSync(pwd, 12);
    collection.insertOne(
      {
        _id: _id,
        nome: nome,
        cognome: cogn,
        dataNascita: datanascita,
        email: email,
        pwd: pwd,
        admin: 0,
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

//Login
dispatcher.addListener("POST", "/api/ctrlLogin", function (req, res) {
  let mongoConnection = mongoClient.connect(CONNECTION_STRING);
  mongoConnection.catch((err) => {
    console.log(err);
    error(req, res, { code: 503, message: "Server Mongo Error" });
  });
  mongoConnection.then((client) => {
    let db = client.db("Cinema");
    let collection = db.collection("utenti");
    let email = req["post"].email;
    collection.findOne({ email: email }, function (err, dbUser) {
      if (err)
        error(req, res, {
          code: 500,
          message: "Errore di esecuzione della query",
        });
      else {
        if (dbUser == null)
          error(req, res, {
            code: 401,
            message: "Errore di autenticazione: email errata",
          });
        else {
          if (
            /*bcrypt.compareSync(req["post"].password, dbUser.pwd)*/ req["post"]
              .password == dbUser.pwd
          ) {
            /*tokenAdministration.createToken(dbUser);
            res.setHeader(
              "Set-Cookie",
              "token=" +
                tokenAdministration.token +
                "max-age=" +
                60 * 60 * 24 +
                ";Path=/"
            );*/
            res.writeHead(200, headerJSON);
            res.end(JSON.stringify(dbUser));
          } else
            error(req, res, {
              code: 401,
              message: "Errore di autenticazione: password errata",
            });
        }
      }
      client.close();
    });
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
