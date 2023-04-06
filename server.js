"use strict";
const mongoFunctions = require("./mongoFunctions");
const tokenAdministration = require("./tokenAdministration");
const fs = require("fs");
//const HTTPS = require("https");
let nodemailer = require("nodemailer");

const express = require("express");
//const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
//const bcrypt = require("bcrypt");

app.listen(8888, function () {
  let port = this.address().port;
  console.log("Server listening on port %s...", port);
});

// Online RSA Key Generator
/*const privateKey = fs.readFileSync("keys/privateKey.pem", "utf8");
const certificate = fs.readFileSync("keys/certificate.crt", "utf8");
const credentials = { key: privateKey, cert: certificate };

const TIMEOUT = 1000;
let port = 8888;

var httpsServer = HTTPS.createServer(credentials, app);
httpsServer.listen(port, "127.0.0.1", function () {
  console.log("Server running on port %s...", port);
});*/

// middleware
app.use("/", bodyParser.urlencoded({ extended: true }));
app.use("/", bodyParser.json());
//app.use(cors());

app.use("/", function (req, res, next) {
  console.log(">_ " + req.method + ": " + req.originalUrl);
  if (Object.keys(req.query).length != 0)
    console.log("Parametri GET: " + JSON.stringify(req.query));
  if (Object.keys(req.body).length != 0)
    console.log("Parametri BODY: " + JSON.stringify(req.body));
  next();
});

app.use("/", express.static("./static"));

//ctrlToken da fare all'avvio nelle pagine
app.get("/api/ctrlToken", function (req, res) {
  tokenAdministration.ctrlTokenLocalStorage(req, function (payload) {
    if (!payload.err_exp) {
      //token ok
      tokenAdministration.createToken(payload);
      res.send({ msg: "Token OK", token: tokenAdministration.token });
    } else {
      //token inesistente o scaduto
      console.log(payload.message);
      error(req, res, { code: 403, message: payload.message });
    }
  });
});

//login
app.post("/api/ctrlLogin", function (req, res) {
  let query = { email: req.body.email, pwd: req.body.pwd };
  mongoFunctions.findLogin(
    req,
    "Cinema1",
    "utenti",
    query,
    function (err, data) {
      if (err.codErr == -1) {
        console.log("Login OK");
        console.log(data);
        tokenAdministration.createToken(data);
        res.send({ msg: "Login OK", token: tokenAdministration.token });
      } else error(req, res, { code: err.codErr, message: err.message });
    }
  );
});

//registrazione
app.post("/api/registraUtente", function (req, res) {
  let query = {
    nome: req.body.nome,
    cognome: req.body.cognome,
    dataNascita: req.body.dataNascita,
    email: req.body.email,
    pwd: req.body.pwd,
    admin: 0,
  };
  //let pwdCrypted = bcrypt.hashSync(pwd, 12);

  mongoFunctions.findOne(
    "Cinema1",
    "utenti",
    { email: query.email },
    function (err, data) {
      if (err.codErr == -1) {
        if (data == null) {
          mongoFunctions.aggregate(
            "Cinema1",
            "utenti",
            [{ $sort: { _id: -1 } }, { $limit: 1 }],
            function (err, data) {
              if (err.codErr == -1) {
                //InsertOne
                query._id = parseInt(data[0]._id) + 1;
                mongoFunctions.insertOne(
                  req,
                  "Cinema1",
                  "utenti",
                  query,
                  function (err, data) {
                    if (err.codErr == -1) {
                      res.send(
                        "Registrazione andata a buon fine. Ora puoi effettuare il login"
                      );
                    } else
                      error(req, res, {
                        code: err.codErr,
                        message: err.message,
                      });
                  }
                );
              }
            }
          );
        } else
          error(req, res, {
            code: 401,
            message: "Errore di registrazione: email già registrata",
          });
      }
    }
  );
});

//Richiesta per l'elenco dei film, passare vettore genere come parametro (value della multiselect)
//Il value della select quando c'è tutto o niente selezionato è ""
app.post("/api/elencoFilm", function (req, res) {
  let query = {};

  if (req.body.genere == "") query = {};
  else
    query = {
      genere: { $in: req.body.genere },
    };

  /*tokenAdministration.ctrlTokenLocalStorage(req, function (payload) {
    if (!payload.err_exp) {*/
  //token ok
  mongoFunctions.find("Cinema1", "film", query, function (err, data) {
    if (err.codErr == -1) {
      //tokenAdministration.createToken(payload);
      res.send({ dati: data /*token: tokenAdministration.token*/ });
    } else error(req, res, { code: err.codErr, message: err.message });
  });
  /*} else {
      //token inesistente o scaduto
      console.log(payload.message);
      error(req, res, { code: 403, message: payload.message });
    }
  });*/
});

//Insert del film da parte dell'admin
app.post("/api/inserisciFilm", function (req, res) {
  let query = {
    titolo: req.body.titolo,
    genere: req.body.genere,
    durata: req.body.durata,
    copertina: req.body.copertina,
    descrizione: req.body.descrizione,
    tendenza: parseInt(req.body.tendenza),
  };

  tokenAdministration.ctrlTokenLocalStorage(req, function (payload) {
    if (!payload.err_exp) {
      //token ok
      mongoFunctions.findOne(
        "Cinema1",
        "film",
        { titolo: query.titolo },
        function (err, data) {
          if (err.codErr == -1) {
            if (data == null) {
              mongoFunctions.aggregate(
                "Cinema1",
                "film",
                [{ $sort: { _id: -1 } }, { $limit: 1 }],
                function (err, data) {
                  if (err.codErr == -1) {
                    //InsertOne
                    query._id = parseInt(data[0]._id) + 1;
                    mongoFunctions.insertOne(
                      req,
                      "Cinema1",
                      "film",
                      query,
                      function (err, data) {
                        if (err.codErr == -1) {
                          tokenAdministration.createToken(payload);

                          //Salvare file img
                          /*let fileContent;
                          let reader = new FileReader();
                          reader.readAsDataURL(req.body.imgFile);
                          reader.onload = function () {
                            fileContent = reader.result;
                          };

                          fs.write(
                            "/images/copertine/" + query.copertina,
                            fileContent
                          );*/

                          res.send({
                            msg: "Inserimento del film andato a buon fine",
                            token: tokenAdministration.token,
                          });
                        } else
                          error(req, res, {
                            code: err.codErr,
                            message: err.message,
                          });
                      }
                    );
                  }
                }
              );
            } else
              error(req, res, {
                code: 401,
                message: "Errore: film già presente nell'elenco",
              });
          }
        }
      );
    } else {
      //token inesistente o scaduto
      console.log(payload.message);
      error(req, res, { code: 403, message: payload.message });
    }
  });
});

//Richiesta per l'elenco dei film in tendenza (i primi 8 in ordine di tendenza)
app.get("/api/filmTendenza", function (req, res) {
  mongoFunctions.aggregate(
    "Cinema1",
    "film",
    [{ $sort: { tendenza: -1 } }, { $limit: 8 }],
    function (err, data) {
      if (err.codErr == -1) {
        res.send({ dati: data });
      } else error(req, res, { code: err.codErr, message: err.message });
    }
  );
});

//Richiesta per i film in base alla data delle proiezioni
//Prima find sulle Proiezioni in base al giorno della data
//poi find con la $in nei Film
app.get("/api/filmDataProiezioni", function (req, res) {
  let dataOggi = new Date();
  let data2 = new Date(new Date().setDate(new Date().getDate() + 1));
  let data3 = new Date(new Date().setDate(new Date().getDate() + 2));

  let query = [
    {
      $project: {
        day: { $dayOfMonth: "$DataProiezione" },
        month: { $month: "$DataProiezione" },
        year: { $year: "$DataProiezione" },
        IDFilm: 1,
        IDSala: 1,
      },
    },
    {
      $match: {
        $or: [
          {
            $and: [
              { day: dataOggi.getDay() },
              {
                month: dataOggi.getMonth(),
              },
              {
                year: dataOggi.getFullYear(),
              },
            ],
          },
          {
            $and: [
              { day: data2.getDay() },
              {
                month: data2.getMonth(),
              },
              {
                year: data2.getFullYear(),
              },
            ],
          },
          {
            $and: [
              { day: data3.getDay() },
              {
                month: data3.getMonth(),
              },
              {
                year: data3.getFullYear(),
              },
            ],
          },
        ],
      },
    },
  ];

  query = [
    {
      $project: {
        day: { $dayOfMonth: "$DataProiezione" },
        month: { $month: "$DataProiezione" },
        year: { $year: "$DataProiezione" },
        IDFilm: 1,
        IDSala: 1,
      },
    },
    {
      $match: {
        $and: [
          { day: dataOggi.getDay() },
          {
            month: dataOggi.getMonth(),
          },
          {
            year: dataOggi.getFullYear(),
          },
        ],
      },
    },
  ];

  query = {};

  mongoFunctions.find("Cinema1", "proiezioni", query, function (err, data) {
    if (err.codErr == -1) {
      //vettore degli IDFilm
      let vetFilm = [];
      data.forEach((proiezione) => {
        vetFilm.push(proiezione.IDFilm);
      });
      let vetProiezioni = data;
      //find dei film
      query = { _id: { $in: vetFilm } };
      mongoFunctions.find("Cinema1", "film", query, function (err, data) {
        if (err.codErr == -1) {
          res.send({ film: data, proiezioni: vetProiezioni });
        } else error(req, res, { code: err.codErr, message: err.message });
      });
    } else error(req, res, { code: err.codErr, message: err.message });
  });
});

//Insert delle sale
app.post("/api/inserisciSala", function (req, res) {
  let query = {
    nome: req.body.nome,
    posti: parseInt(req.body.posti),
    dimensioniSchermo: req.body.dimensioniSchermo,
    tipoPoltrone: req.body.tipoPoltrone,
  };

  tokenAdministration.ctrlTokenLocalStorage(req, function (payload) {
    if (!payload.err_exp) {
      //token ok
      mongoFunctions.findOne(
        "Cinema1",
        "sale",
        { nome: query.nome },
        function (err, data) {
          if (err.codErr == -1) {
            if (data == null) {
              mongoFunctions.aggregate(
                "Cinema1",
                "sale",
                [{ $sort: { _id: -1 } }, { $limit: 1 }],
                function (err, data) {
                  if (err.codErr == -1) {
                    //InsertOne
                    query._id = parseInt(data[0]._id) + 1;
                    mongoFunctions.insertOne(
                      req,
                      "Cinema1",
                      "sale",
                      query,
                      function (err, data) {
                        if (err.codErr == -1) {
                          tokenAdministration.createToken(payload);
                          res.send({
                            msg: "Inserimento della sala andato a buon fine",
                            token: tokenAdministration.token,
                          });
                        } else
                          error(req, res, {
                            code: err.codErr,
                            message: err.message,
                          });
                      }
                    );
                  }
                }
              );
            } else
              error(req, res, {
                code: 401,
                message: "Errore: sala già presente nell'elenco",
              });
          }
        }
      );
    } else {
      //token inesistente o scaduto
      console.log(payload.message);
      error(req, res, { code: 403, message: payload.message });
    }
  });
});

//elenco Sale
app.post("/api/elencoSale", function (req, res) {
  let query = {};

  if (req.body.tipoPoltrone == "") query = {};
  else
    query = {
      tipoPoltrone: { $in: req.body.tipoPoltrone },
    };

  /*tokenAdministration.ctrlTokenLocalStorage(req, function (payload) {
    if (!payload.err_exp) {*/
  //token ok
  mongoFunctions.find("Cinema1", "sale", query, function (err, data) {
    if (err.codErr == -1) {
      //tokenAdministration.createToken(payload);
      res.send({ dati: data /*token: tokenAdministration.token*/ });
    } else error(req, res, { code: err.codErr, message: err.message });
  });
  /*} else {
      //token inesistente o scaduto
      console.log(payload.message);
      error(req, res, { code: 403, message: payload.message });
    }
  });*/
});

//Insert delle proiezioni
app.post("/api/inserisciProiezione", function (req, res) {
  let query = {
    IDFilm: parseInt(req.body.IDFilm),
    IDSala: parseInt(req.body.IDSala),
    DataProiezione: new Date(req.body.DataProiezione),
  };

  tokenAdministration.ctrlTokenLocalStorage(req, function (payload) {
    if (!payload.err_exp) {
      //token ok
      mongoFunctions.findOne(
        "Cinema1",
        "proiezioni",
        {
          IDFilm: query.IDFilm,
          IDSala: query.IDSala,
          DataProiezione: query.DataProiezione,
        },
        function (err, data) {
          if (err.codErr == -1) {
            if (data == null) {
              mongoFunctions.aggregate(
                "Cinema1",
                "proiezioni",
                [{ $sort: { _id: -1 } }, { $limit: 1 }],
                function (err, data) {
                  if (err.codErr == -1) {
                    //InsertOne
                    query._id = parseInt(data[0]._id) + 1;
                    mongoFunctions.insertOne(
                      req,
                      "Cinema1",
                      "proiezioni",
                      query,
                      function (err, data) {
                        if (err.codErr == -1) {
                          tokenAdministration.createToken(payload);
                          res.send({
                            msg: "Inserimento della proiezione andato a buon fine",
                            token: tokenAdministration.token,
                          });
                        } else
                          error(req, res, {
                            code: err.codErr,
                            message: err.message,
                          });
                      }
                    );
                  }
                }
              );
            } else
              error(req, res, {
                code: 401,
                message: "Errore: proiezione già presente nella programmazione",
              });
          }
        }
      );
    } else {
      //token inesistente o scaduto
      console.log(payload.message);
      error(req, res, { code: 403, message: payload.message });
    }
  });
});

/* ************************************************************* */
function error(req, res, err) {
  res.status(err.code).send(err.message);
}

// default route finale
app.use("/", function (req, res, next) {
  res.status(404);
  fs.readFile("./static/404.html", function (err, content) {
    if (err)
      content =
        "<h1>Risorsa non trovata</h1>" +
        "<h2><a href='/'>Back to Home</a></h2>";
    let pageNotFound = content.toString();
    res.send(pageNotFound);
  });
});
