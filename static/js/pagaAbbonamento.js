"use strict";

$(() => {
  $("#linkAbbonati").hide();
  $("#linkAdmin").hide();
  let ctrlToken = sendRequestNoCallback("/api/ctrlToken", "GET", {});
  ctrlToken.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    $("#btnAccedi").html("Logout");
    if (localStorage.getItem("abbonamento") != null) loginDone();
    else logout();
  });
  ctrlToken.fail(function (jqXHR) {
    error(jqXHR);
    $("#btnAccedi").html("Accedi");
    window.location.href = "index.html";
  });
});

function logout() {
  $("#linkAbbonati").hide();
  $("#linkAdmin").hide();
  window.location.href = "index.html";
}

function loginDone() {
  $("#linkAbbonati").show();
  let prezzo;
  let tipoAbbonamento = localStorage.getItem("abbonamento");
  if (tipoAbbonamento == "standard") prezzo = 30;
  else if (tipoAbbonamento == "regular") prezzo = 45;
  else prezzo = 70;
  $(".txtPrezzo").html(prezzo + "€");
  let token = localStorage.getItem("token");
  let payload = parseJwt(token);
  if (payload.admin == 1) $("#linkAdmin").show();
}

function parseJwt(token) {
  let payload = token.split(".")[1];
  payload = payload.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(window.atob(payload));
}

function eseguiPagamento() {
  let abbonati = sendRequestNoCallback("/api/abbonati", "POST", {
    abbonamento: localStorage.getItem("abbonamento"),
  });
  abbonati.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    window.location.href = "index.html";
  });
  abbonati.fail(function (jqXHR) {
    error(jqXHR);
  });
}
