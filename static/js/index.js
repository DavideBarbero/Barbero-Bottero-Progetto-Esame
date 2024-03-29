"use strict";

$(() => {
  $("#insFilm").hide();
  $("#divPreHome").hide();
  $("#divCounterProiezioni").hide();
  $("#sectionAbbonamenti").hide();
  $("#linkAbbonati").hide();
  $("#linkAdmin").hide();

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
    logout();
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
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
  ];
  let dataOggi = new Date();
  let data2 = new Date(new Date().setDate(new Date().getDate() + 1));
  let data3 = new Date(new Date().setDate(new Date().getDate() + 2));

  $("#title-date1").html(dataOggi.getDate() + " " + mesi[dataOggi.getMonth()]);
  $("#day-date1").html(giorni[parseInt(dataOggi.getDay())]);

  $("#title-date2").html(data2.getDate() + " " + mesi[data2.getMonth()]);
  $("#day-date2").html(giorni[parseInt(data2.getDay())]);

  $("#title-date3").html(data3.getDate() + " " + mesi[data3.getMonth()]);
  $("#day-date3").html(giorni[parseInt(data3.getDay())]);

  //Film tendenza
  let filmTendenza = sendRequestNoCallback("/api/filmTendenza", "GET", {});
  filmTendenza.fail(function (jqXHR) {
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
    creaFilm3giorni(serverData.film, serverData.proiezioni);
  });
  film.fail(function (jqXHR) {
    error(jqXHR);
  });

  $("#btnFunzionalita").on("click", function () {
    window.location.href = "funzioni.html";
  });

  $(".btnAbbonamento").on("click", function () {
    let abbonamento = this.id;
    localStorage.setItem("abbonamento", abbonamento);
    window.location.href = "pagaAbbonamento.html";
  });

  //Nuovi film
  let nuoviFilm = sendRequestNoCallback("/api/nuoviFilm", "GET", {});
  nuoviFilm.done(function (serverData) {
    serverData = JSON.parse(serverData);
    caricaNuoviFilm(serverData.dati);
  });
  nuoviFilm.fail(function (jqXHR) {
    error(jqXHR);
  });
});

function parseJwt(token) {
  let payload = token.split(".")[1];
  payload = payload.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(window.atob(payload));
}

function loginDone() {
  $("#linkAbbonati").show();
  let token = localStorage.getItem("token");
  let payload = parseJwt(token);
  $("#txtInfoPersonali").html(
    "Bentornato " + payload.cognome + " " + payload.nome
  );

  if (payload.admin == 1) {
    $("#insFilm").show();
    $("#linkAdmin").show();
  }

  let getPrenotazioneUtente = sendRequestNoCallback(
    "/api/getProiezioneUtente",
    "GET",
    {}
  );
  getPrenotazioneUtente.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    console.log(serverData);
    if (serverData["proiezioni"].length > 0) {
      $("#divPreHome").show();
      $("#divCounterProiezioni").show();
      $("#lstPrenotazioniHome").on("change", function () {
        let vetVal = $("#lstPrenotazioniHome").val().split("-");
        let dataSelezionata = new Date(vetVal[0]);
        $("#imgPreHome").attr("src", vetVal[2]);
        $("#dataPreHome").html(
          dataSelezionata.getDate() +
            "/" +
            (parseInt(dataSelezionata.getMonth()) + 1) +
            "/" +
            dataSelezionata.getFullYear() +
            " - " +
            dataSelezionata.getHours() +
            ":" +
            dataSelezionata.getMinutes()
        );

        let diffTime = Math.abs(dataSelezionata - new Date());

        let diffSeconds = Math.trunc(diffTime % 1000);
        let diffMinutes = Math.trunc((diffTime / 1000 / 60) % 60);
        let diffHours = Math.trunc((diffTime / 1000 / 60 / 60) % 24);
        let diffDays = Math.trunc(diffTime / 1000 / 60 / 60 / 24);

        $("#giorniMancanti").html(diffDays);
        $("#oreMancanti").html(diffHours);
        $("#minutiMancanti").html(diffMinutes);
      });
      caricaListaPrenotazioni(serverData);
    }
  });
  getPrenotazioneUtente.fail(function (jqXHR) {
    error(jqXHR);
  });

  $("#" + payload.abbonamento).html("Attuale");
  $("#" + payload.abbonamento).prop("disabled", true);
  $("#sectionAbbonamenti").show();
}

function logout() {
  $("#txtInfoPersonali").html("Accedi per una navigazione Personalizzata!");
  $("#insFilm").hide();
  $("#divPreHome").hide();
  $("#divCounterProiezioni").hide();
  $("#sectionAbbonamenti").hide();
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

function creaFilm3giorni(films, proiezioni) {
  let dataOggi = new Date();
  let data2 = new Date(new Date().setDate(new Date().getDate() + 1));
  let data3 = new Date(new Date().setDate(new Date().getDate() + 2));

  console.log(films);
  console.log(proiezioni);
  let tabpanel;

  let vetProiezioni1 = [],
    vetProiezioni2 = [],
    vetProiezioni3 = [];

  proiezioni.forEach((proiezione) => {
    if (
      new Date(proiezione["DataProiezione"]).getDate() == dataOggi.getDate() &&
      new Date(proiezione["DataProiezione"]).getMonth() ==
        dataOggi.getMonth() &&
      new Date(proiezione["DataProiezione"]).getFullYear() ==
        dataOggi.getFullYear()
    ) {
      vetProiezioni1.push(proiezione);
    } else if (
      new Date(proiezione["DataProiezione"]).getDate() == data2.getDate() &&
      new Date(proiezione["DataProiezione"]).getMonth() == data2.getMonth() &&
      new Date(proiezione["DataProiezione"]).getFullYear() ==
        data2.getFullYear()
    ) {
      vetProiezioni2.push(proiezione);
    }
    if (
      new Date(proiezione["DataProiezione"]).getDate() == data3.getDate() &&
      new Date(proiezione["DataProiezione"]).getMonth() == data3.getMonth() &&
      new Date(proiezione["DataProiezione"]).getFullYear() ==
        data3.getFullYear()
    ) {
      vetProiezioni3.push(proiezione);
    }
  });

  //Film giorno1
  tabpanel = $("#date1");

  if (vetProiezioni1.length == 0)
    tabpanel.text("Non ci sono proiezioni in questo giorno");

  vetProiezioni1.forEach((proiezione) => {
    let filmProiettato;
    films.forEach((singoloFilm) => {
      if (proiezione.IDFilm == singoloFilm._id) filmProiettato = singoloFilm;
    });

    let programmazione =
      "<div class='schedule-listing' id='divschedule" +
      proiezione._id +
      "'><div class='schedule-slot-time'><span> " +
      new Date(proiezione.DataProiezione).getHours() +
      " : " +
      new Date(proiezione.DataProiezione).getMinutes() +
      "</span>" +
      filmProiettato.titolo +
      "</div><div class='schedule-slot-info'><a href='prenotazioni.html' id='linkpret-" +
      proiezione._id +
      "'><img class='schedule-slot-speakers' src='" +
      filmProiettato.copertina +
      "' alt='' /></a><div class='schedule-slot-info-content'><h3 class='schedule-slot-title'>" +
      filmProiettato.titolo +
      "<strong>" +
      filmProiettato.genere +
      "</strong></h3><p>" +
      filmProiettato.descrizione +
      "</p></div></div></div>";

    tabpanel.append(programmazione);
  });

  //Film giorno2
  tabpanel = $("#date2");

  if (vetProiezioni2.length == 0)
    tabpanel.text("Non ci sono proiezioni in questo giorno");

  vetProiezioni2.forEach((proiezione) => {
    let filmProiettato;
    films.forEach((singoloFilm) => {
      if (proiezione.IDFilm == singoloFilm._id) filmProiettato = singoloFilm;
    });

    let programmazione =
      "<div class='schedule-listing' id='divschedule" +
      proiezione._id +
      "'><div class='schedule-slot-time'><span> " +
      new Date(proiezione.DataProiezione).getHours() +
      " : " +
      new Date(proiezione.DataProiezione).getMinutes() +
      "</span>" +
      filmProiettato.titolo +
      "</div><div class='schedule-slot-info'><a href='prenotazioni.html' id='linkpret-" +
      proiezione._id +
      "'><img class='schedule-slot-speakers' src='" +
      filmProiettato.copertina +
      "' alt='' /></a><div class='schedule-slot-info-content'><h3 class='schedule-slot-title'>" +
      filmProiettato.titolo +
      "<strong>" +
      filmProiettato.genere +
      "</strong></h3><p>" +
      filmProiettato.descrizione +
      "</p></div></div></div>";

    tabpanel.append(programmazione);
  });

  //Film giorno3
  tabpanel = $("#date3");

  if (vetProiezioni3.length == 0)
    tabpanel.text("Non ci sono proiezioni in questo giorno");

  vetProiezioni3.forEach((proiezione) => {
    let filmProiettato;
    films.forEach((singoloFilm) => {
      if (proiezione.IDFilm == singoloFilm._id) filmProiettato = singoloFilm;
    });

    let programmazione =
      "<div class='schedule-listing' id='divschedule" +
      proiezione._id +
      "' ><div class='schedule-slot-time'><span> " +
      new Date(proiezione.DataProiezione).getHours() +
      " : " +
      new Date(proiezione.DataProiezione).getMinutes() +
      "</span>" +
      filmProiettato.titolo +
      "</div><div class='schedule-slot-info'><a href='prenotazioni.html' id='linkpret-" +
      proiezione._id +
      "'><img class='schedule-slot-speakers' src='" +
      filmProiettato.copertina +
      "' alt='' /></a><div class='schedule-slot-info-content'><h3 class='schedule-slot-title'>" +
      filmProiettato.titolo +
      "<strong>" +
      filmProiettato.genere +
      "</strong></h3><p>" +
      filmProiettato.descrizione +
      "</p></div></div></div>";

    tabpanel.append(programmazione);
  });

  $("[href='prenotazioni.html']").on("click", function () {
    localStorage.setItem("proiezione", $(this).attr("id"));
  });
}

function caricaListaPrenotazioni(data) {
  let film = data.film;
  let proiezioni = data.proiezioni;
  let lista = $("#lstPrenotazioniHome");
  lista.html("");
  proiezioni.forEach((proiezione) => {
    let newOpt = $("<option>");
    lista.append(newOpt);
    let selectedFilm = {};
    film.forEach((sFilm) => {
      if (sFilm._id == proiezione.IDFilm) selectedFilm = sFilm;
    });
    let date = new Date(proiezione.DataProiezione);
    newOpt
      .html(
        date.getDate() +
          "/" +
          (parseInt(date.getMonth()) + 1) +
          "/" +
          date.getFullYear() +
          " - " +
          selectedFilm.titolo
      )
      .val(date + "-" + selectedFilm.titolo + "-" + selectedFilm.copertina); //modificare
  });
  lista.trigger("change");
}

function caricaNuoviFilm(data) {
  let div = $("#divNuoviFilm");
  div.html("");
  data.forEach((film, index) => {
    let divNuovoFilm;
    if (index > 0) {
      divNuovoFilm =
        "<div class='col-lg-4 wow fadeInUp' data-wow-duration='1.5s' data-wow-delay='400ms' ><div class='post'><div class='post-media post-image'><img src='" +
        film.copertina +
        "' class='img-fluid' alt='" +
        film.titolo +
        "' style='width:183px;' /></div><div class='post-body'><div class='entry-header'><h2 class='entry-title'><a href='film.html#popup_" +
        film._id +
        "' class='view-speaker ts-image-popup' >" +
        film.titolo +
        "</a></h2></div><div class='post-footer'><a href='film.html#popup_" +
        film._id +
        "' class='btn-link view-speaker ts-image-popup' >Per dettagli <i class='icon icon-arrow-right'></i></a></div></div></div></div>";
    } else {
      divNuovoFilm =
        "<div class='col-lg-4 wow fadeInUp' data-wow-duration='1.5s' data-wow-delay='400ms' ><div class='post'><div class='post-media post-image'><img src='" +
        film.copertina +
        "' class='img-fluid' alt='" +
        film.titolo +
        "' style='width:600px;'/></div><div class='post-body'><div class='entry-header'><h2 class='entry-title'><a href='film.html#popup_" +
        film._id +
        "' class='view-speaker ts-image-popup' >" +
        film.titolo +
        "</a></h2></div><div class='post-footer'><a href='film.html#popup_" +
        film._id +
        "' class='btn-link view-speaker ts-image-popup' >Per dettagli <i class='icon icon-arrow-right'></i></a></div></div></div></div>";
    }

    div.append(divNuovoFilm);
  });
}
