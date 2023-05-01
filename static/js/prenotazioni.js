"use strict";

$(() => {
  $(window).on("load", function () {
    $("#preloader").remove();
  });

  let ctrlToken = sendRequestNoCallback("/api/ctrlToken", "GET", {});
  ctrlToken.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    $("#btnAccedi").html("Logout");
    loginDone();
  });
  ctrlToken.fail(function (jqXHR) {
    //Tornare alla pagina originale
    error(jqXHR);
    $("#btnAccedi").html("Accedi");
    window.location.href = "index.html";
  });
});

function logout() {
  window.location.href = "index.html";
}

function loginDone() {
  let prenotazioneID = localStorage.getItem("prenotazione");
  prenotazioneID = parseInt(prenotazioneID.split("-")[1]);

  let getPrenotazione = sendRequestNoCallback("/api/getPrenotazione", "POST", {
    _id: prenotazioneID,
  });
  getPrenotazione.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    caricaPrenotazione(serverData.dati);
  });
  getPrenotazione.fail(function (jqXHR) {
    error(jqXHR);
    $("#btnAccedi").html("Accedi");
    window.location.href = "index.html";
  });
}

function caricaPrenotazione(prenotazione) {
  console.log(prenotazione);
}
