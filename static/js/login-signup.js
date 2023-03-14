"use strict";

$(() => {
  $("#btnAccedi").html("Accedi");
  $("#btnAccedi").on("click", getModal);
  $("#btnLoginModal").on("click", getModalLogin);
  $("#btnRegModal").on("click", getModalReg);
  $("#btnLogin").on("click", eseguiLogin);
  $("#btnReg").on("click", eseguiRegistra);
});

function getModal() {
  if ($("#btnAccedi").html() == "Accedi") {
    $("#modalLogin").modal("show");
  } else {
    $("#btnAccedi").html("Accedi");
    $("#txtEmail").val("");
    $("#txtPwd").val("");
    localStorage.removeItem("token");
  }
}

function getModalLogin() {
  $("#modalLogin").modal("show");
  $("#modalReg").modal("hide");
}

function getModalReg() {
  $("#modalReg").modal("show");
  $("#modalLogin").modal("hide");
}

function eseguiLogin() {
  let email = $("#txtEmail").val();
  let pwd = $("#txtPwd").val();
  let login = sendRequestNoCallback("/api/ctrlLogin", "POST", {
    email: email,
    pwd: pwd,
  });
  login.fail(function (jqXHR) {
    $("#pError").text(jqXHR.responseText);
    //error(jqXHR);
  });
  login.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    let token = localStorage.getItem("token");
    let payload = parseJwt(token);
    $("#modalLogin").modal("hide");
    $("#pError").html("");
    $("#btnAccedi").html("Logout");
  });
}

function eseguiRegistra() {
  if ($("#txtEmailReg").val() == "") $("#txtEmailReg").focus();
  else if ($("#txtPwdReg").val() == "") $("#txtPwdReg").focus();
  else if ($("#txtNome").val() == "") $("#txtNome").focus();
  else if ($("#txtCognome").val() == "") $("#txtCognome").focus();
  else if ($("#txtDataNascita").val() == "") $("#txtDataNascita").focus();
  else {
    let registra = sendRequestNoCallback("/api/registraUtente", "POST", {
      nome: $("#txtNome").val(),
      cognome: $("#txtCognome").val(),
      dataNascita: $("#txtDataNascita").val(),
      email: $("#txtEmailReg").val(),
      pwd: $("#txtPwdReg").val(),
    });
    registra.fail(function (jqXHR) {
      $("#pErrorReg").text(jqXHR.responseText);
      //error(jqXHR);
    });
    registra.done(function (serverData) {
      $("#modalReg").modal("hide");
    });
  }
}

function parseJwt(token) {
  let payload = token.split(".")[1];
  payload = payload.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(window.atob(payload));
}
