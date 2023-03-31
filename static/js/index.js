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

  //Film tendenza
  let filmTendenza = sendRequestNoCallback("/api/filmTendenza", "GET", {});
  filmTendenza.fail(function (jqXHR) {
    //Tornare alla pagina originale
    error(jqXHR);
  });
  filmTendenza.done(function (serverData) {
    serverData = JSON.parse(serverData);
    creaFilmTendenza(serverData.dati);
  });

  //Visualizzazione film dei prossimi 3 giorni
  let film = sendRequestNoCallback("/api/filmDataProiezioni", "GET", {});
  film.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    console.log(serverData.dati);
    creaFilm3giorni(serverData.dati);
  });
  film.fail(function (jqXHR) {
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

function creaFilmTendenza(film) {
  $("#elencoFilmTendenza").html("");
  //Creare le card dei film di tendenza
  for (let i = 0; i < film.length; i++) {
    let cardFilm =
      "<div class='col-lg-3 col-md-6'><div class='ts-speaker'><div class='speaker-img'><img class='img-fluid' src='images/copertine/" +
      film[i].copertina +
      "' alt=''/><a href='#popup_0" +
      i +
      "' class='view-speaker ts-image-popup' data-effect='mfp-zoom-in'><i class='icon icon-plus'></i></a></div><div class='ts-speaker-info'><h3 class='ts-title'><a href='#'>" +
      film[i].titolo +
      "</a></h3><p>" +
      film[i].titolo +
      "</p></div></div><div id='popup_0" +
      i +
      "' class='container ts-speaker-popup mfp-hide'><div class='row'><div class='col-lg-6'><div class='ts-speaker-popup-img'><img src='images/copertine/" +
      film[i].copertina +
      "' alt='' /></div></div><div class='col-lg-6'><div class='ts-speaker-popup-content'><h3 class='ts-title'>" +
      film[i].titolo +
      "</h3><span class='speakder-designation'>" +
      film[i].genere +
      "</span><img class='company-logo' src='images/sponsors/sponsor-6.png' alt=''/><p>" +
      film[i].titolo +
      "</p><h4 class='session-name'>" +
      film[i].titolo +
      "</h4><div class='row'><div class='col-lg-6'><div class='speaker-session-info'><h4>Giorno proiezione</h4><span> Ora proiezione </span><p>Sala proiezione</p></div></div><div class='col-lg-6'><div class='speaker-session-info'><h4>Giorno proiezione 2</h4><span> Ora proiezione 2 </span><p>Sala proiezione 2</p></div></div></div><div class='ts-speakers-social'><a href='#'><i class='fa fa-facebook'></i></a><a href='#'><i class='fa fa-twitter'></i></a><a href='#'><i class='fa fa-instagram'></i></a><a href='#'><i class='fa fa-google-plus'></i></a><a href='#'><i class='fa fa-linkedin'></i></a></div></div></div></div></div></div>";

    $("#elencoFilmTendenza").append(cardFilm);
  }
}

function creaFilm3giorni(film) {
  //Film giorno1
  //Film giorno2
  //Film giorno3
}
