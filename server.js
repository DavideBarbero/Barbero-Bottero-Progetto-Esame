"use strict";

const fs = require("fs");
const dispatcher = require("./dispatcher");
const http = require("http");
let header = { "Content-Type": "text/html;charset=utf-8" };
let headerJSON = { "Content-Type": "application/json;charset=utf-8" };
const jwt = require("jsonwebtoken");
const privateKey = fs.readFileSync("keys/private.key", "UTF8");
const mongo = require("mongodb");
const mongoClient = mongo.MongoClient;
const bcrypt = require("bcrypt");
const CONNECTION_STRING = "mongodb://127.0.0.1:27017";
const CONNECION_OPTIONS = { useNewUrlParser: true };
const tokenAdministration = require("./tokenAdministration");
const { readCookie, payload } = require("./tokenAdministration");

let database = "Cinema";
let json;

//Registrazione
dispatcher.addListener("POST", "/api/registraUtente", function (req, res) {
  aggregate2(
    res,
    "utenti",
    [{ $sort: { _id: -1 } }, { $limit: 1 }],
    function (ris) {
      let par = req["post"];
      let _id = parseInt(ris[0]._id) + 1;
      let nome = par["nome"];
      let cogn = par["cogn"];
      let datanascita = par["data"];
      let email = par["email"];
      let pwd = par["pwd"];
      //let pwdCrypted = bcrypt.hashSync(pwd, 12);
      insertOne(res, "utenti", {
        _id: _id,
        nome: nome,
        cognome: cogn,
        dataNascita: datanascita,
        email: email,
        pwd: pwd,
        admin: 0,
      });
    }
  );
});

//Login
dispatcher.addListener("POST", "/api/ctrlLogin", function (req, res) {
  findOne2(res, "utenti", { email: req["post"].email }, function (dbUser) {
    if (dbUser == null)
      error(req, res, {
        code: 401,
        message: "Errore di autenticazione: email errata",
      });
    else {
      if (
        /*bcrypt.compareSync(req["post"].password, dbUser.pwd)*/ req["post"]
          .pwd == dbUser.pwd
      ) {
        tokenAdministration.createToken(dbUser);
        res.setHeader(
          "Set-Cookie",
          "token=" +
            tokenAdministration.token +
            "max-age=" +
            60 * 60 * 24 +
            ";Path=/"
        );
        res.writeHead(200, headerJSON);
        res.end(JSON.stringify(dbUser));
      } else
        error(req, res, {
          code: 401,
          message: "Errore di autenticazione: password errata",
        });
    }
  });
});

function error(req, res, err) {
  console.log(err.message);
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

function creaConnessione(nomeDb, response, callback) {
  console.log(mongoClient);
  let promise = mongoClient.connect(CONNECTION_STRING);
  promise.then(function (connessione) {
    callback(connessione, connessione.db(nomeDb));
  });
  promise.catch(function (err) {
    json = { cod: -1, desc: "Errore nella connessione" };
    response.end(JSON.stringify(json));
  });
}

function findOne2(res, col, obj, callback) {
  creaConnessione(database, res, function (conn, db) {
    let promise = db.collection(col).findOne(obj);
    promise.then(function (ris) {
      conn.close();
      callback(ris);
    });

    promise.catch(function (error) {
      obj = { cod: -2, desc: "Errore nella ricerca" };
      res.end(JSON.stringify(obj));
      conn.close();
    });
  });
}

function find2(res, col, obj, select, callback) {
  creaConnessione(database, res, function (conn, db) {
    let promise = db.collection(col).find(obj).project(select).toArray();
    promise.then(function (ris) {
      conn.close();
      callback(ris);
    });

    promise.catch(function (error) {
      obj = { cod: -2, desc: "Errore nella ricerca" };
      res.end(JSON.stringify(obj));
      conn.close();
    });
  });
}

function find(res, col, obj, select) {
  creaConnessione(database, res, function (conn, db) {
    let promise = db.collection(col).find(obj).project(select).toArray();
    promise.then(function (ris) {
      //console.log(ris);
      obj = { cod: 0, desc: "Dati trovati con successo", ris };
      res.end(JSON.stringify(obj));
      conn.close();
    });

    promise.catch(function (error) {
      obj = { cod: -2, desc: "Errore nella ricerca" };
      res.end(JSON.stringify(obj));
      conn.close();
    });
  });
}

function aggregate(res, col, opzioni) {
  creaConnessione(database, res, function (conn, db) {
    let promise = db.collection(col).aggregate(opzioni).toArray();
    promise.then(function (ris) {
      //console.log(ris);
      obj = { cod: 0, desc: "Dati trovati con successo", ris };
      res.end(JSON.stringify(obj));
      conn.close();
    });

    promise.catch(function (error) {
      obj = { cod: -2, desc: "Errore nella ricerca" };
      res.end(JSON.stringify(obj));
      conn.close();
    });
  });
}

function aggregate2(res, col, opzioni, callback) {
  creaConnessione(database, res, function (conn, db) {
    let promise = db.collection(col).aggregate(opzioni).toArray();
    promise.then(function (ris) {
      conn.close();
      callback(ris);
      //conn.close() prima della callback così chiudo la connessione prima di aprirne una nuova
    });

    promise.catch(function (error) {
      obj = { cod: -2, desc: "Errore nella ricerca" };
      res.end(JSON.stringify(obj));
      conn.close();
    });
  });
}

function insertOne(res, col, obj) {
  creaConnessione(database, res, function (conn, db) {
    let promise = db.collection(col).insertOne(obj);
    promise.then(function (ris) {
      json = { cod: 1, desc: "Insert in esecuzione", ris };
      res.end(JSON.stringify(json));
      conn.close();
    });
    promise.catch(function (err) {
      obj = { cod: -2, desc: "Errore nell'inserimento" };
      res.end(JSON.stringify(obj));
      conn.close();
    });
  });
}
