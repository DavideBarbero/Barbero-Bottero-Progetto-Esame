"use strict";

const mongo = require("mongodb");
const bcrypt = require("bcrypt");
const mongoClient = mongo.MongoClient;
const CONNECTION_STRING =
  "mongodb+srv://ebottero1716:bottero.edoardo@cinema.sx3blbo.mongodb.net/?retryWrites=true&w=majority";
const CONNECTION_OPTIONS = { useNewUrlParser: true };

let mongoFunctions = function () {};

function setConnection(nomeDb, col, callback) {
  let errConn = { codErr: -1, message: "" };
  let mongoConnection = mongoClient.connect(CONNECTION_STRING);
  mongoConnection.catch((err) => {
    console.log("Errore di connessione al server Mongo " + err);
    errConn.codErr = 503; //Errore di server
    errConn.message = "Errore di connessione al server Mongo";
    callback(errConn, null, null);
  });
  mongoConnection.then((client) => {
    let db = client.db(nomeDb);
    callback(errConn, db.collection(col), client);
  });
}

mongoFunctions.prototype.find = function (nomeDb, collection, query, callback) {
  setConnection(nomeDb, collection, function (errConn, coll, client) {
    if (errConn.codErr == -1) {
      coll.find(query).toArray(function (errQ, data) {
        client.close();
        if (!errQ) callback({ codErr: -1, message: "" }, data);
        else
          callback(
            { codErr: 500, message: "Errore durante l'esecuzione della query" },
            {}
          );
      });
    } else {
      callback(errConn, {});
    }
  });
};

mongoFunctions.prototype.findLogin = function (
  req,
  nomeDb,
  collection,
  query,
  callback
) {
  setConnection(nomeDb, collection, function (errConn, coll, client) {
    if (errConn.codErr == -1) {
      //No Error
      let loginUser = coll.findOne(query);
      loginUser.then(function (data) {
        let errData;
        if (data == null) {
          errData = {
            codErr: 401,
            message: "Errore di login. Username inesistente",
          };
        } else {
          //if (bcrypt.compareSync(req["post"].password, data.pwd)) {
          if (req.body.pwd == data.pwd) {
            errData = {
              codErr: -1,
              message: "",
            }; //Login OK
          } else
            errData = {
              codErr: 401,
              message: "Errore di login. Password errata",
            };
        }
        callback(errData, data);
        client.close();
      });
      loginUser.catch(function (err) {
        callback(
          {
            codErr: 500,
            message: "Errore durante l'esecuzione della query",
          },
          {}
        );
        client.close();
      });
    } else {
      callback(errConn, {});
    }
  });
};

mongoFunctions.prototype.registra = function (
  req,
  nomeDb,
  collection,
  query,
  callback
) {
  setConnection(nomeDb, collection, function (errConn, coll, client) {
    if (errConn.codErr == -1) {
      //No Error
      //query.pwd = bcrypt.hashSync(query.pwd, 12);
      coll.insertOne(query, function (errQ, data) {
        client.close();
        if (!errQ) {
          callback(
            {
              codErr: -1,
              message: "",
            },
            data
          );
        } else {
          callback(
            {
              codErr: 500,
              message: "Errore durante l'esecuzione della query",
            },
            {}
          );
        }
      });
    } else {
      callback(errConn, {});
    }
  });
};

mongoFunctions.prototype.insertOne = function (
  req,
  nomeDb,
  collection,
  query,
  callback
) {
  setConnection(nomeDb, collection, function (errConn, coll, client) {
    if (errConn.codErr == -1) {
      //No Error
      coll.insertOne(query, function (errQ, data) {
        client.close();
        if (!errQ) {
          callback(
            {
              codErr: -1,
              message: "",
            },
            data
          );
        } else {
          callback(
            {
              codErr: 500,
              message: "Errore durante l'esecuzione della query",
            },
            {}
          );
        }
      });
    } else {
      callback(errConn, {});
    }
  });
};

mongoFunctions.prototype.findOne = function (
  nomeDb,
  collection,
  query,
  callback
) {
  setConnection(nomeDb, collection, function (errConn, coll, client) {
    if (errConn.codErr == -1) {
      coll.findOne(query, function (errQ, data) {
        client.close();
        let errQuery = { codErr: -1, message: "" };
        if (!errQ) callback(errQuery, data);
        else {
          errQuery.codErr = 500;
          errQuery.message = "Errore durante l'esecuzione della query su Mongo";
          callback(errQuery, {});
        }
      });
    } else callback(errConn, {});
  });
};

mongoFunctions.prototype.aggregate = function (
  nomeDb,
  collection,
  query,
  callback
) {
  setConnection(nomeDb, collection, function (errConn, coll, client) {
    if (errConn.codErr == -1) {
      coll.aggregate(query).toArray(function (errQ, data) {
        client.close();
        if (!errQ) callback({ codErr: -1, message: "" }, data);
        else
          callback(
            { codErr: 500, message: "Errore durante l'esecuzione della query" },
            {}
          );
      });
    } else {
      callback(errConn, {});
    }
  });
};

mongoFunctions.prototype.updateOne = function (
  nomeDb,
  collection,
  query,
  update,
  callback
) {
  setConnection(nomeDb, collection, function (errConn, coll, client) {
    if (errConn.codErr == -1) {
      coll.updateOne(query, update, function (errQ, data) {
        client.close();
        if (!errQ) callback({ codErr: -1, message: "" }, data);
        else
          callback(
            { codErr: 500, message: "Errore durante l'esecuzione della query" },
            {}
          );
      });
    } else {
      callback(errConn, {});
    }
  });
};

module.exports = new mongoFunctions();
