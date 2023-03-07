"use strict";

$(() => {
  $("#btnAccedi").on("click", getModal);
  $("#btnLoginModal").on("click", getModalLogin);
  $("#btnRegModal").on("click", getModalReg);
  $("#pError").hide();
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
    error(jqXHR);
  });
  login.done(function (serverData) {
    if (!JSON.stringify(serverData).includes("Errore")) {
      $("#modalLogin").modal("hide");
      $("#pError").html("");
      $("#btnAccedi").html("Logout");
    } else {
      $("#pError").show();
      $("#pError").html(serverData);
    }
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
      error(jqXHR);
    });
    registra.done(function (serverData) {
      console.log(serverData);
      $("#modalReg").modal("hide");
    });
  }
}