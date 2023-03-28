"use strict";

$(() => {
  $("#insFilm").hide();
  let ctrlToken = sendRequestNoCallback("/api/ctrlToken", "GET", {});
  ctrlToken.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    $("#btnAccedi").html("Logout");
    loginDone();
  });
  ctrlToken.fail(function (jqXHR) {
    //Tornare alla pagina originale
    $("#btnAccedi").html("Accedi");
    $("#txtInfoPersonali").html("Accedi per una navigazione Personalizzata!");
  });

  //3 giorni successivi
  let mesi = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];
  let giorni = [
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
    "Domenica",
  ];
  let dataOggi = new Date();
  let data2 = new Date(new Date().setDate(new Date().getDate() + 1));
  let data3 = new Date(new Date().setDate(new Date().getDate() + 2));

  $("#title-date1").html(dataOggi.getDate() + " " + mesi[dataOggi.getMonth()]);
  $("#day-date1").html(giorni[dataOggi.getDay()]);

  $("#title-date2").html(data2.getDate() + " " + mesi[data2.getMonth()]);
  $("#day-date2").html(giorni[data2.getDay()]);

  $("#title-date3").html(data3.getDate() + " " + mesi[data3.getMonth()]);
  $("#day-date3").html(giorni[data3.getDay()]);

  //Visualizzazione film dei prossimi 3 giorni
  let film1 = sendRequestNoCallback("/api/filmDataProiezioni1", "GET", {});
  film1.done(function (serverData) {
    console.log(serverData);
  });
  film1.fail(function (jqXHR) {
    error(jqXHR);
  });

  $("#btnFunzionalita").on("click", function () {
    window.location.href = "funzioni.html";
  });
});

function parseJwt(token) {
  let payload = token.split(".")[1];
  payload = payload.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(window.atob(payload));
}

function loginDone() {
  let token = localStorage.getItem("token");
  let payload = parseJwt(token);
  $("#txtInfoPersonali").html(
    "Bentornato " + payload.cognome + " " + payload.nome
  );

  if (payload.admin == 1) {
    $("#insFilm").show();
  }
}

function logout() {
  $("#txtInfoPersonali").html("Accedi per una navigazione Personalizzata!");
  $("#insFilm").hide();
}
