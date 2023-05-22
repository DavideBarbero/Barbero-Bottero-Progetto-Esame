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
    abbonamento: "base",
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
                      //Inizio parte mail
                      let pwd = "wrlaqyzyqgmufgjv";
                      let transport = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                          user: "bemoviebybeb@gmail.com",
                          pass: pwd,
                        },
                      });
                      process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

                      let bodyHtml =
                        "<!DOCTYPE html><html lang='en'><head>  <meta charset='UTF-8'>  <meta name='viewport' content='width=device-width, initial-scale=1.0'>  <title>Conferma abbonamento</title>  <style>    /* CSS generale */    body {      font-family: Arial, sans-serif;      line-height: 1.6;     background-color: blueviolet;      margin: 0;      padding: 0;    }    /* Contenitore principale */    .container {      max-width: 600px;      margin: 0 auto;      padding: 20px;  background-color:violet;  }    /* Intestazione */    .header {      text-align: center;      margin-bottom: 30px;    }    .header h1 {      color: blueviolet;      margin: 0;      font-size: 24px;    }    /* Contenuto */    .content {      background-color: white;      padding: 30px;      border-radius: 5px;    }    .content p {      margin: 0 0 20px;      color: black;    }    .content ul {      padding-left: 20px;      margin: 0 0 20px;    }    .content ul li {      margin-bottom: 10px;    }    /* Footer */    .footer {      text-align: center;      margin-top: 30px;      color: white;      font-size: 14px;    }  </style></head><body>  <div class='container'>    <div class='header'>      <h1>Registrazione completata</h1>    </div>    <div class='content'>      <p>Gentile " +
                        query.cognome +
                        " " +
                        query.nome +
                        ",</p>      <p>La registrazione a BeMovie è completata. Ti ringraziamo di averci scelto e ti diamo il benvenuto nel cinema del futuro.</p>      <p>Grazie per aver scelto BeMovie!</p>    </div>        <div class='footer'>      <p>© 2023 BeMovie. Tutti i diritti riservati.</p>    </div>  </div></body></html>";

                      const message = {
                        from: "bemoviebybeb@gmail.com",
                        to: query.email,
                        subject: "Registrazione completata",
                        html: bodyHtml,
                      };
                      transport.sendMail(message, function (err, info) {
                        if (err) {
                          console.log(err);
                          process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
                          res.end("Errore di invio mail");
                        } else {
                          console.log(info);
                          process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
                          res.end(JSON.stringify(info));
                        }
                      });
                      //Fine parte mail
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
                          mongoFunctions.find(
                            "Cinema1",
                            "newsletter",
                            {},
                            function (err, data) {
                              if (err.codErr == -1) {
                                let vetMail = [];
                                data.forEach((email) => {
                                  vetMail.push(email.email);
                                });
                                //Inizio parte mail
                                let pwd = "wrlaqyzyqgmufgjv";
                                let transport = nodemailer.createTransport({
                                  service: "gmail",
                                  auth: {
                                    user: "bemoviebybeb@gmail.com",
                                    pass: pwd,
                                  },
                                });
                                process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

                                let bodyHtml =
                                  "<!DOCTYPE html><html lang='en'><head>  <meta charset='UTF-8'>  <meta name='viewport' content='width=device-width, initial-scale=1.0'>  <title>Nuovo film aggiunto</title>  <style>    /* CSS generale */    body {      font-family: Arial, sans-serif;      line-height: 1.6;     background-color: blueviolet;      margin: 0;      padding: 0;    }    /* Contenitore principale */    .container {      max-width: 600px;      margin: 0 auto;      padding: 20px;  background-color:violet;  }    /* Intestazione */    .header {      text-align: center;      margin-bottom: 30px;    }    .header h1 {      color: blueviolet;      margin: 0;      font-size: 24px;    }    /* Contenuto */    .content {      background-color: white;      padding: 30px;      border-radius: 5px;    }    .content p {      margin: 0 0 20px;      color: black;    }    .content ul {      padding-left: 20px;      margin: 0 0 20px;    }    .content ul li {      margin-bottom: 10px;    }    /* Footer */    .footer {      text-align: center;      margin-top: 30px;      color: white;      font-size: 14px;    }  </style></head><body>  <div class='container'>    <div class='header'>      <h1>Nuovo film aggiunto</h1>    </div>    <div class='content'>     <p>E' stato aggiunto un nuovo film a BeMovie!</p>  " +
                                  "<p>Il titolo del film aggiunto è <b>" +
                                  query.titolo +
                                  "</b>.</p><p>Grazie per aver scelto BeMovie!</p>    </div>        <div class='footer'>      <p>© 2023 BeMovie. Tutti i diritti riservati.</p>    </div>  </div></body></html>";

                                const message = {
                                  from: "bemoviebybeb@gmail.com",
                                  //to: vetMail,
                                  bcc: vetMail,
                                  subject: "Nuovo film aggiunto a BeMovie!",
                                  html: bodyHtml,
                                };
                                transport.sendMail(
                                  message,
                                  function (err, info) {
                                    if (err) {
                                      console.log(err);
                                      process.env[
                                        "NODE_TLS_REJECT_UNAUTHORIZED"
                                      ] = 1;
                                      res.end("Errore di invio mail");
                                    } else {
                                      console.log(info);
                                      process.env[
                                        "NODE_TLS_REJECT_UNAUTHORIZED"
                                      ] = 1;
                                      res.end(JSON.stringify(info));
                                    }
                                  }
                                );
                                //Fine parte mail

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
    let nPosti = 0,
      vetPosti = [];

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
              mongoFunctions.findOne(
                "Cinema1",
                "sale",
                { _id: query.IDSala },
                function (err, data) {
                  if (err.codErr == -1) {
                    nPosti = data.posti;
                    for (let i = 0; i < nPosti; i++) {
                      vetPosti.push(0);
                    }
                    mongoFunctions.aggregate(
                      "Cinema1",
                      "proiezioni",
                      [{ $sort: { _id: -1 } }, { $limit: 1 }],
                      function (err, data) {
                        if (err.codErr == -1) {
                          //InsertOne
                          query._id = parseInt(data[0]._id) + 1;
                          query.postiOccupati = vetPosti;
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

//Prende la proiezione scelta
app.post("/api/getProiezione", function (req, res) {
  let query = {
    _id: parseInt(req.body._id),
  };

  tokenAdministration.ctrlTokenLocalStorage(req, function (payload) {
    if (!payload.err_exp) {
      //token ok
      mongoFunctions.findOne(
        "Cinema1",
        "proiezioni",
        query,
        function (err, data) {
          if (err.codErr == -1) {
            tokenAdministration.createToken(payload);
            res.send({
              dati: data,
              token: tokenAdministration.token,
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

app.post("/api/getInfoSalaFilm", function (req, res) {
  let query = {
    IDFilm: parseInt(req.body.IDFilm),
    IDSala: parseInt(req.body.IDSala),
  };

  let ris = {};

  tokenAdministration.ctrlTokenLocalStorage(req, function (payload) {
    if (!payload.err_exp) {
      //token ok
      mongoFunctions.findOne(
        "Cinema1",
        "film",
        { _id: query.IDFilm },
        function (err, data) {
          if (err.codErr == -1) {
            ris = data;
            mongoFunctions.findOne(
              "Cinema1",
              "sale",
              { _id: query.IDSala },
              function (err, data) {
                if (err.codErr == -1) {
                  ris.nomeSala = data.nome;
                  ris.posti = data.posti;
                  tokenAdministration.createToken(payload);
                  res.send({
                    dati: ris,
                    token: tokenAdministration.token,
                  });
                }
              }
            );
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

app.post("/api/prenota", function (req, res) {
  let query = {
    _id: req.body._id,
    postiOccupati: req.body.postiOccupati,
    prezzo: req.body.prezzo,
    postiPrenotati: req.body.postiPrenotati,
    data: req.body.data,
    titolo: req.body.titolo,
    sala: req.body.sala,
    postiScelti: req.body.postiScelti,
    cocacola: req.body.cocacola,
    popcorn: req.body.popcorn,
  };
  tokenAdministration.ctrlTokenLocalStorage(req, function (payload) {
    if (!payload.err_exp) {
      //token ok
      mongoFunctions.updateOne(
        "Cinema1",
        "proiezioni",
        { _id: query._id },
        { $set: { postiOccupati: query.postiOccupati } },
        function (err, data) {
          if (err.codErr == -1) {
            //Inizio parte mail
            let pwd = "wrlaqyzyqgmufgjv";
            let transport = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "bemoviebybeb@gmail.com",
                pass: pwd,
              },
            });
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

            let strPostiScelti = "";
            for (let i = 0; i < query["postiScelti"].length; i++) {
              strPostiScelti += query["postiScelti"][i] + ", ";
            }

            let bodyHtml =
              "<!DOCTYPE html><html lang='en'><head>  <meta charset='UTF-8'>  <meta name='viewport' content='width=device-width, initial-scale=1.0'>  <title>Conferma prenotazione</title>  <style>    /* CSS generale */    body {      font-family: Arial, sans-serif;      line-height: 1.6;     background-color: blueviolet;      margin: 0;      padding: 0;    }    /* Contenitore principale */    .container {      max-width: 600px;      margin: 0 auto;      padding: 20px;  background-color:violet;  }    /* Intestazione */    .header {      text-align: center;      margin-bottom: 30px;    }    .header h1 {      color: blueviolet;      margin: 0;      font-size: 24px;    }    /* Contenuto */    .content {      background-color: white;      padding: 30px;      border-radius: 5px;    }    .content p {      margin: 0 0 20px;      color: black;    }    .content ul {      padding-left: 20px;      margin: 0 0 20px;    }    .content ul li {      margin-bottom: 10px;    }    /* Footer */    .footer {      text-align: center;      margin-top: 30px;      color: white;      font-size: 14px;    }  </style></head><body>  <div class='container'>    <div class='header'>      <h1>Conferma prenotazione</h1>    </div>    <div class='content'>      <p>Gentile " +
              payload.cognome +
              " " +
              payload.nome +
              ",</p>      <p>La tua prenotazione è stata confermata. Di seguito sono riportati i dettagli della prenotazione:</p>      <ul>        <li><strong>Film:</strong> " +
              query.titolo +
              "</li>        <li><strong>Data:</strong> " +
              query.data +
              "</li>        <li><strong>Sala:</strong> " +
              query.sala +
              "</li>        <li><strong>Posti prenotati:</strong> " +
              query.postiPrenotati +
              "</li>      <li><strong>Posti scelti:</strong> " +
              strPostiScelti +
              "</li><li><strong>Porzioni di Pop Corn:</strong> " +
              query.popcorn +
              "</li><li><strong>Porzioni di Coca Cola:</strong> " +
              query.cocacola +
              "</li></ul>      <p>Grazie per aver scelto BeMovie!</p>    </div>        <div class='footer'>      <p>© 2023 BeMovie. Tutti i diritti riservati.</p>    </div>  </div></body></html>";

            const message = {
              from: "bemoviebybeb@gmail.com",
              to: payload.email,
              subject:
                "Prenotazione a nome di " +
                payload.cognome +
                " " +
                payload.nome,
              html: bodyHtml,
            };
            transport.sendMail(message, function (err, info) {
              if (err) {
                console.log(err);
                process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
                res.end("Errore di invio mail");
              } else {
                console.log(info);
                process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
                res.end(JSON.stringify(info));
              }
            });
            //Fine parte mail
            tokenAdministration.createToken(payload);
            res.send({
              msg: "La prenotazione da lei effettuata è andata a buon fine. Le arriverà un'ulteriore conferma via mail",
              token: tokenAdministration.token,
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

//Prende le proiezioni future del singolo utente
app.get("/api/getProiezioneUtente", function (req, res) {
  let query = {};

  let risProiezioni = [];
  let risFilm = [];

  tokenAdministration.ctrlTokenLocalStorage(req, function (payload) {
    if (!payload.err_exp) {
      //token ok
      query = {
        postiOccupati: payload._id,
        DataProiezione: { $gt: new Date() },
      };
      mongoFunctions.aggregate(
        "Cinema1",
        "proiezioni",
        [{ $match: query }, { $sort: { DataProiezione: -1 } }],
        function (err, data) {
          if (err.codErr == -1) {
            risProiezioni = data;
            let vetIdFilm = [];
            risProiezioni.forEach((proiezione) => {
              vetIdFilm.push(proiezione.IDFilm);
            });
            mongoFunctions.find(
              "Cinema1",
              "film",
              { _id: { $in: vetIdFilm } },
              function (err, data) {
                if (err.codErr == -1) {
                  risFilm = data;
                  tokenAdministration.createToken(payload);
                  res.send({
                    film: risFilm,
                    proiezioni: risProiezioni,
                    token: tokenAdministration.token,
                  });
                }
              }
            );
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

app.post("/api/abbonati", function (req, res) {
  let query = {
    abbonamento: req.body.abbonamento,
  };
  tokenAdministration.ctrlTokenLocalStorage(req, function (payload) {
    if (!payload.err_exp) {
      //token ok
      mongoFunctions.updateOne(
        "Cinema1",
        "utenti",
        { _id: payload._id },
        { $set: { abbonamento: query.abbonamento } },
        function (err, data) {
          if (err.codErr == -1) {
            //Inizio parte mail
            let pwd = "wrlaqyzyqgmufgjv";
            let transport = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "bemoviebybeb@gmail.com",
                pass: pwd,
              },
            });
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

            let bodyHtml =
              "<!DOCTYPE html><html lang='en'><head>  <meta charset='UTF-8'>  <meta name='viewport' content='width=device-width, initial-scale=1.0'>  <title>Conferma abbonamento</title>  <style>    /* CSS generale */    body {      font-family: Arial, sans-serif;      line-height: 1.6;     background-color: blueviolet;      margin: 0;      padding: 0;    }    /* Contenitore principale */    .container {      max-width: 600px;      margin: 0 auto;      padding: 20px;  background-color:violet;  }    /* Intestazione */    .header {      text-align: center;      margin-bottom: 30px;    }    .header h1 {      color: blueviolet;      margin: 0;      font-size: 24px;    }    /* Contenuto */    .content {      background-color: white;      padding: 30px;      border-radius: 5px;    }    .content p {      margin: 0 0 20px;      color: black;    }    .content ul {      padding-left: 20px;      margin: 0 0 20px;    }    .content ul li {      margin-bottom: 10px;    }    /* Footer */    .footer {      text-align: center;      margin-top: 30px;      color: white;      font-size: 14px;    }  </style></head><body>  <div class='container'>    <div class='header'>      <h1>Conferma abbonamento</h1>    </div>    <div class='content'>      <p>Gentile " +
              payload.cognome +
              " " +
              payload.nome +
              ",</p>      <p>L'abbonamento da lei effettuato è stato confermato. Di seguito sono riportati i dettagli dell'abbonamento:</p>      <ul>        <li><strong>Tipo abbonamento:</strong> " +
              query.abbonamento +
              "</li>        </ul>      <p>Grazie per aver scelto BeMovie!</p>    </div>        <div class='footer'>      <p>© 2023 BeMovie. Tutti i diritti riservati.</p>    </div>  </div></body></html>";

            const message = {
              from: "bemoviebybeb@gmail.com",
              to: payload.email,
              subject: "Abbonamento andato a buon fine",
              html: bodyHtml,
            };
            transport.sendMail(message, function (err, info) {
              if (err) {
                console.log(err);
                process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
                res.end("Errore di invio mail");
              } else {
                console.log(info);
                process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
                res.end(JSON.stringify(info));
              }
            });
            //Fine parte mail
            tokenAdministration.createToken(payload);
            res.send({
              msg: "L'abbonamento da lei scelto è avvenuto con successo",
              token: tokenAdministration.token,
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

//Ultimi film inseriti
app.get("/api/nuoviFilm", function (req, res) {
  mongoFunctions.aggregate(
    "Cinema1",
    "film",
    [
      { $project: { _id: 1, titolo: 1, copertina: 1 } },
      { $sort: { _id: -1 } },
      { $limit: 3 },
    ],
    function (err, data) {
      if (err.codErr == -1) {
        res.send({ dati: data });
      } else error(req, res, { code: err.codErr, message: err.message });
    }
  );
});

//Iscrizione alla newsletter
app.post("/api/newsletter", function (req, res) {
  let query = {
    email: req.body.email,
  };

  mongoFunctions.findOne(
    "Cinema1",
    "newsletter",
    { email: query.email },
    function (err, data) {
      if (err.codErr == -1) {
        if (data == null) {
          mongoFunctions.insertOne(
            req,
            "Cinema1",
            "newsletter",
            query,
            function (err, data) {
              if (err.codErr == -1) {
                res.send({
                  msg: "Da ora in poi sei iscritto alla newsletter",
                });
              } else
                error(req, res, {
                  code: err.codErr,
                  message: err.message,
                });
            }
          );
        } else
          error(req, res, {
            code: 401,
            message: "Errore: questa mail è già iscritta alla newsletter",
          });
      }
    }
  );
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
