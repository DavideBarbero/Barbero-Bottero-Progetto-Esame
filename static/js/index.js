"use strict";

$(() => {
  let ctrlToken = sendRequestNoCallback("/api/ctrlToken", "GET", {});
  ctrlToken.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    $("#btnAccedi").html("Logout");
    let token = localStorage.getItem("token");
    let payload = parseJwt(token);
    $("#txtInfoPersonali").html(
      "Bentornato " + payload.cognome + " " + payload.nome
    );
  });
  ctrlToken.fail(function (jqXHR) {
    //Tornare alla pagina originale
    $("#btnAccedi").html("Accedi");
    $("#txtInfoPersonali").html("Accedi per una navigazione Personalizzata!");
  });
});

function parseJwt(token) {
  let payload = token.split(".")[1];
  payload = payload.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(window.atob(payload));
}
