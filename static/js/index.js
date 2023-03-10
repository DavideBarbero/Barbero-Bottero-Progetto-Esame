"use strict";

$(() => {
  $("#btnAccedi").html("Accedi"); //Forse è così solo per me
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
    Cookies.set("token", "-1");
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
    $("#pError").text(
      JSON.stringify(jqXHR.responseText).replace('"', "").replace('"', "")
    );
    error(jqXHR);
  });
  login.done(function (serverData) {
    alert(serverData.nome);
    $("#modalLogin").modal("hide");
    $("#pError").html("");
    $("#btnAccedi").html("Logout");
    $("#txtInfoPersonali").html(
      "Bentornato " + serverData.cognome + " " + serverData.nome
    );
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
      cogn: $("#txtCognome").val(),
      data: $("#txtDataNascita").val(),
      email: $("#txtEmailReg").val(),
      pwd: $("#txtPwdReg").val(),
    });
    registra.fail(function (jqXHR) {
      $("#pErrorReg").text(
        JSON.stringify(jqXHR.responseText).replace('"', "").replace('"', "")
      );
      error(jqXHR);
    });
    registra.done(function (serverData) {
      console.log(serverData);
      $("#modalReg").modal("hide");
    });
  }
}
