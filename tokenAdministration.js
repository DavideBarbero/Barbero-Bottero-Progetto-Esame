const jwt = require("jsonwebtoken");
const fs = require("fs");

let tokenAdministration = function () {
  this.payload = "";
  this.token = "";
  this.valoreCookie = "";
  this.privateKey = fs.readFileSync("keys/private.key", "UTF8");
};

tokenAdministration.prototype.ctrlTokenLocalStorage = function (req, callback) {
  const token = req.headers["token"].split(" ")[1];
  if (token != "null") {
    jwt.verify(token, this.privateKey, function (err, data) {
      if (!err) this.payload = data;
      else
        this.payload = { err_exp: true, message: "Token scaduto o corrotto" };
      callback(this.payload);
    });
  } else {
    this.payload = { err_exp: true, message: "Token inesistente" };
    callback(this.payload);
  }
};

tokenAdministration.prototype.ctrlToken = function (req, callback) {
  this.payload = "";
  this.token = this.readCookie(req, "token");
  let errToken = { codErr: -1, message: "" };
  if (this.token == "")
    errToken = { codErr: 403, message: "token inesistente" };
  else {
    try {
      this.payload = jwt.verify(this.token, this.privateKey);
      console.log("Token ok");
    } catch (err) {
      errToken = { codErr: 403, message: "Token scaduto o compromesso" };
    }
  }
  callback(errToken);
};

tokenAdministration.prototype.createToken = function (user) {
  this.token = jwt.sign(
    {
      _id: user._id,
      nome: user.nome,
      cognome: user.cognome,
      dataNascita: user.dataNascita,
      email: user.email,
      admin: user.admin,
      abbonamento: user.abbonamento,
      exp: Math.floor(Date.now() / 1000 + 60 * 30),
    },
    this.privateKey
  );
  console.log("Creato nuovo token: " + this.token);
};

tokenAdministration.prototype.readCookie = function (req, nome) {
  this.valoreCookie = "";
  if (req.headers.cookie) {
    let cookies = req.headers.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
      cookies[i] = cookies[i].split("=");
      if (cookies[i][0] == nome) {
        this.valoreCookie = cookies[i][1];
        break;
      }
    }
  }
  return this.valoreCookie;
};

module.exports = new tokenAdministration();
