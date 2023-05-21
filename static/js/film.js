"use strict";

$(() => {
  $("#linkAbbonati").hide();
  $("#linkAdmin").hide();
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
    error(jqXHR);
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

function creaFilm(film) {
  $("#elencoFilm").html("");
  //Creare le card dei film con i dati ritornati
  for (let i = 0; i < film.length; i++) {
    let cardFilm =
      "<div class='col-lg-3 col-md-6'><div class='ts-speaker'><div class='speaker-img'><img class='img-fluid' src='images/copertine/" +
      film[i].copertina +
      "' alt=''/><a id='link_" +
      film[i]._id +
      "' href='#popup_" +
      film[i]._id +
      "' class='view-speaker ts-image-popup' data-effect='mfp-zoom-in'><i class='icon icon-plus'></i></a></div><div class='ts-speaker-info'><h3 class='ts-title'><a href='#'>" +
      film[i].titolo +
      "</a></h3><p>" +
      film[i].genere +
      "</p></div></div><div id='popup_" +
      film[i]._id +
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
    error(jqXHR);
  });
  elencoFilm.done(function (serverData) {
    serverData = JSON.parse(serverData);
    creaFilm(serverData.dati);
    //caricaListaGeneri(serverData.dati);
  });

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
}

function loginDone() {
  let token = localStorage.getItem("token");
  let payload = parseJwt(token);
  $("#linkAbbonati").show();
  if (payload.admin == 1) $("#linkAdmin").show();
}

function logout() {
  $("#linkAbbonati").hide();
  $("#linkAdmin").hide();
}

function creaFilmTendenza(film) {
  $("#elencoFilmTendenza").html("");
  //Creare le card dei film di tendenza
  for (let i = 0; i < film.length; i++) {
    let cardFilm =
      "<div class='col-lg-3 col-md-6'><div class='ts-speaker'><div class='speaker-img'><img class='img-fluid' src='images/copertine/" +
      film[i].copertina +
      "' alt=''/><a href='#popup_0" +
      film[i]._id +
      "' class='view-speaker ts-image-popup' data-effect='mfp-zoom-in'><i class='icon icon-plus'></i></a></div><div class='ts-speaker-info'><h3 class='ts-title'><a href='#'>" +
      film[i].titolo +
      "</a></h3><p>" +
      film[i].genere +
      "</p></div></div><div id='popup_0" +
      film[i]._id +
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

function caricaListaGeneri(data) {
  let lista = $("#filtroGenere");
  lista.html("");

  let vetGeneri = [];
  let vetGeneriMod = [];

  for (let i = 0; i < data.length; i++) {
    vetGeneri.push(data[i].genere);
  }

  vetGeneriMod = vetGeneri.filter((element, index) => {
    return vetGeneri.indexOf(element) === index;
  });

  for (let i = 0; i < vetGeneriMod.length; i++) {
    let newOpt = $("<option>");
    newOpt.html(vetGeneriMod[i]).val(vetGeneriMod[i]);
    lista.append(newOpt);
  }
}
