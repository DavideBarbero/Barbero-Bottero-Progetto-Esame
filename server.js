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
const CONNECTION_STRING =
  "mongodb+srv://ebottero1716:bottero.edoardo@cinema.sx3blbo.mongodb.net/?retryWrites=true&w=majority";
const CONNECION_OPTIONS = { useNewUrlParser: true };
const tokenAdministration = require("./tokenAdministration");
const { readCookie, payload } = require("./tokenAdministration");

let database = "Cinema1";
let json;

//Registrazione
dispatcher.addListener("POST", "/api/registraUtente", function (req, res) {
  findOne2(res, "utenti", { email: req["post"]["email"] }, function (ris) {
    if (ris == null) {
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
    } else
      error(req, res, {
        code: 401,
        message: "Errore di registrazione: email già registrata",
      });
  });
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

//Richiesta per l'elenco dei film, passare genere come parametro (value della multiselect)
//Il value della select "Tutti" è ""
dispatcher.addListener("POST", "/api/elencoFilm", function (req, res) {
  //tokenAdministration.ctrlToken(req, function (err) {
  //if (err.codErr == -1) {
  let query = {};
  if (req["post"]["genere"] == "") query = {};
  else query = { Genere: req["post"]["genere"] };

  find2(res, "film", query, {}, function (ris) {
    tokenAdministration.createToken(tokenAdministration.payload);
    res.setHeader(
      "Set-Cookie",
      "token=" +
        tokenAdministration.token +
        "max-age=" +
        60 * 60 * 24 +
        ";Path=/"
    );
    res.writeHead(200, headerJSON);
    res.end(JSON.stringify(ris));
  });
  //} else error(req, res, { code: err.codErr, message: err.message });
  //});
});

//Insert del film da parte dell'admin
dispatcher.addListener("POST", "/api/inserisciFilm", function (req, res) {
  //tokenAdministration.ctrlToken(req, function (err) {
  //if (err.codErr == -1) {
  findOne2(res, "film", { nome: req["post"]["nome"] }, function (ris) {
    if (ris == null) {
      aggregate2(
        res,
        "film",
        [{ $sort: { _id: -1 } }, { $limit: 1 }],
        function (ris) {
          let par = req["post"];
          let _id = parseInt(ris[0]._id) + 1;
          let nome = par["nome"];
          let genere = par["genere"];
          let durata = par["durata"];
          let copertina = par["copertina"];
          insertOne(res, "film", {
            _id: _id,
            nome: nome,
            genere: genere,
            durata: durata,
            copertina: copertina,
          });
        }
      );
    } else
      error(req, res, {
        code: 401,
        message: "Errore: film già presente nell'elenco",
      });
  });
  //} else error(req, res, { code: err.codErr, message: err.message });
  //});
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
