"use strict";

$(() => {
  $("#linkAbbonati").hide();
  $("#linkAdmin").hide();

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
      "<div class='col-lg-3 col-md-6'><div class='ts-speaker'><div class='speaker-img'><img class='img-fluid' src='" +
      film[i].copertina +
      "' alt=''/><a href='#popup_" +
      film[i]._id +
      "' class='view-speaker ts-image-popup' data-effect='mfp-zoom-in'><i class='icon icon-plus'></i></a></div><div class='ts-speaker-info'><h3 class='ts-title'>" +
      film[i].titolo +
      "</h3><p>" +
      film[i].genere +
      "</p></div></div><div id='popup_" +
      film[i]._id +
      "' class='container ts-speaker-popup mfp-hide'><div class='row'><div class='col-lg-6'><div class='ts-speaker-popup-img'><img src='" +
      film[i].copertina +
      "' alt='' /></div></div><div class='col-lg-6'><div class='ts-speaker-popup-content'><h3 class='ts-title'>" +
      film[i].titolo +
      "</h3><span class='speakder-designation'>" +
      film[i].genere +
      "</span><p><b>Durata:</b> " +
      film[i].durata +
      "</p><p><b>Descrizione:</b> " +
      film[i].descrizione +
      "</p></div></div></div></div></div>";

    $("#elencoFilm").append(cardFilm);
  }

  $(".ts-image-popup").magnificPopup({
    type: "inline",
    closeOnContentClick: false,
    midClick: true,
    callbacks: {
      beforeOpen: function () {
        this.st.mainClass = this.st.el.attr("data-effect");
      },
    },
    zoom: {
      enabled: true,
      duration: 500, // don't foget to change the duration also in CSS
    },
    mainClass: "mfp-fade",
  });
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
    caricaListaGeneri(serverData.dati);
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
      "<div class='col-lg-3 col-md-6'><div class='ts-speaker'><div class='speaker-img'><img class='img-fluid' src='" +
      film[i].copertina +
      "' alt=''/><a href='#popup_0" +
      film[i]._id +
      "' class='view-speaker ts-image-popup' data-effect='mfp-zoom-in'><i class='icon icon-plus'></i></a></div><div class='ts-speaker-info'><h3 class='ts-title'>" +
      film[i].titolo +
      "</h3><p>" +
      film[i].genere +
      "</p></div></div><div id='popup_0" +
      film[i]._id +
      "' class='container ts-speaker-popup mfp-hide'><div class='row'><div class='col-lg-6'><div class='ts-speaker-popup-img'><img src='" +
      film[i].copertina +
      "' alt='' /></div></div><div class='col-lg-6'><div class='ts-speaker-popup-content'><h3 class='ts-title'>" +
      film[i].titolo +
      "</h3><span class='speakder-designation'>" +
      film[i].genere +
      "</span><p><b>Durata:</b> " +
      film[i].durata +
      "</p><p><b>Descrizione:</b> " +
      film[i].descrizione +
      "</p></div></div></div></div></div>";

    $("#elencoFilmTendenza").append(cardFilm);
  }

  $(".ts-image-popup").magnificPopup({
    type: "inline",
    closeOnContentClick: false,
    midClick: true,
    callbacks: {
      beforeOpen: function () {
        this.st.mainClass = this.st.el.attr("data-effect");
      },
    },
    zoom: {
      enabled: true,
      duration: 500, // don't foget to change the duration also in CSS
    },
    mainClass: "mfp-fade",
  });
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
  lista.multiselect();
}
