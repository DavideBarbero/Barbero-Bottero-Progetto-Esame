"use strict";

$(() => {
  $(window).on("load", function () {
    $("#preloader").remove();
  });

  $("#filtroGenere").multiselect();

  film();

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
  });

  //on change della multiselect
  $("#filtroGenere").on("change", function () {
    let vetGeneri = [];
    let vetOption = $("#filtroGenere").children("option").toArray();
    for (let i = 0; i < vetOption.length; i++) {
      if (vetOption[i].selected) vetGeneri.push(vetOption[i].value);
    }

    let elencoFilm = sendRequestNoCallback("/api/elencoFilm", "POST", {
      genere: vetGeneri,
    });
    elencoFilm.fail(function (jqXHR) {
      error(jqXHR);
    });
    elencoFilm.done(function (serverData) {
      serverData = JSON.parse(serverData);
      localStorage.setItem("token", serverData.token);
      creaFilm(serverData.dati);
    });
  });
});

//Sistemare popup che non esce
function creaFilm(film) {
  $("#elencoFilm").html("");
  //Creare le card dei film con i dati ritornati
  console.log(film);
  for (let i = 0; i < film.length; i++) {
    let cardFilm =
      "<div class='col-lg-3 col-md-6'><div class='ts-speaker'><div class='speaker-img'><img class='img-fluid' src='images/copertine/" +
      film[i].copertina +
      "' alt=''/><a href='#popup_" +
      i +
      "' class='view-speaker ts-image-popup' data-effect='mfp-zoom-in'><i class='icon icon-plus'></i></a></div><div class='ts-speaker-info'><h3 class='ts-title'><a href='#'>" +
      film[i].titolo +
      "</a></h3><p>" +
      film[i].titolo +
      "</p></div></div><div id='popup_" +
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

    $("#elencoFilm").append(cardFilm);
  }
}

function film() {
  let elencoFilm = sendRequestNoCallback("/api/elencoFilm", "POST", {
    genere: "",
  });
  elencoFilm.fail(function (jqXHR) {
    //Tornare alla pagina originale
    error(jqXHR);
  });
  elencoFilm.done(function (serverData) {
    serverData = JSON.parse(serverData);
    //localStorage.setItem("token", serverData.token);
    creaFilm(serverData.dati);
  });

  //Film tendenza
  let filmTendenza = sendRequestNoCallback("/api/filmTendenza", "GET", {});
  filmTendenza.fail(function (jqXHR) {
    //Tornare alla pagina originale
    error(jqXHR);
  });
  filmTendenza.done(function (serverData) {
    serverData = JSON.parse(serverData);
    //localStorage.setItem("token", serverData.token);
    creaFilmTendenza(serverData.dati);
  });
}

function logout() {}

function creaFilmTendenza(film) {
  $("#elencoFilmTendenza").html("");
  //Creare le card dei film di tendenza
  console.log(film);
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
