"use strict";

let proiezione, prezzoTotale, prezzoPosti, prezzoPopCorn, prezzoCocaCola;
let vetPostiScelti = [];

$(() => {
  $("#linkAbbonati").hide();
  $("#linkAdmin").hide();
  let ctrlToken = sendRequestNoCallback("/api/ctrlToken", "GET", {});
  ctrlToken.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    $("#btnAccedi").html("Logout");
    if (localStorage.getItem("proiezione") != null) loginDone();
    else logout();
  });
  ctrlToken.fail(function (jqXHR) {
    error(jqXHR);
    $("#btnAccedi").html("Accedi");
    window.location.href = "index.html";
  });

  $("#paymentSection").hide();
  $(".nas").show();
});

function logout() {
  $("#linkAbbonati").hide();
  $("#linkAdmin").hide();
  window.location.href = "index.html";
}

function loginDone() {
  $("#linkAbbonati").show();
  let proiezioneID = localStorage.getItem("proiezione");
  proiezioneID = parseInt(proiezioneID.split("-")[1]);

  let getProiezione = sendRequestNoCallback("/api/getProiezione", "POST", {
    _id: proiezioneID,
  });
  getProiezione.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    proiezione = serverData.dati;
    caricaProiezione();
  });
  getProiezione.fail(function (jqXHR) {
    error(jqXHR);
    $("#btnAccedi").html("Accedi");
    window.location.href = "index.html";
  });
  let token = localStorage.getItem("token");
  let payload = parseJwt(token);
  if (payload.admin == 1) $("#linkAdmin").show();
}

function caricaProiezione() {
  if (proiezione["postiOccupati"].includes(0)) {
    $("#btnPrenota").prop("disabled", false);
    $("#btnPrenota").html("Prenota");
  } else {
    $("#btnPrenota").prop("disabled", true);
    $("#btnPrenota").html("Soldout");
  }

  let getInfoSalaFilm = sendRequestNoCallback(
    "/api/getInfoSalaFilm",
    "POST",
    proiezione
  );
  getInfoSalaFilm.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    let info = serverData.dati;
    console.log(info);
    let dataProiezione = new Date(proiezione.DataProiezione);
    $("#dataPre").html(
      dataProiezione.getDate() +
        "/" +
        (parseInt(dataProiezione.getMonth()) + 1) +
        "/" +
        dataProiezione.getFullYear() +
        " - " +
        dataProiezione.getHours() +
        ":" +
        dataProiezione.getMinutes()
    );
    $("#imgPre").prop("src", info.copertina);
    $("#imgPre").prop("alt", info.titolo);
    $("#titoloPre").html(info.titolo);
    $("#descPre").html(info.descrizione);
    $("#durataPre").html(info.durata);
    $("#salaPre").html(info.nomeSala);
    $("#postiPre").html(info.posti);

    let token = localStorage.getItem("token");
    let payload = parseJwt(token);
    let idUtente = parseInt(payload._id);

    for (let i = 0; i < info.posti; i++) {
      let button = $("<button id='" + i + "' ></button>");

      if (proiezione.postiOccupati[i] == idUtente) {
        button.prop("disabled", true);
        button.addClass("postiPrenotati");
      } else if (proiezione.postiOccupati[i] != 0) {
        button.prop("disabled", true);
        button.addClass("posto1");
      }

      $(".seat").append(button);

      button.on("click", function () {
        let idButton = $(this).attr("id");
        if (
          button.attr("class") == undefined ||
          button.attr("class") != "buttonClicked"
        ) {
          button.addClass("buttonClicked");
          proiezione.postiOccupati[idButton] = idUtente;
        } else {
          button.removeClass("buttonClicked");
          proiezione.postiOccupati[idButton] = 0;
        }
      });
    }

    $("#btnPrenota").on("click", function () {
      if ($(".buttonClicked").length == 0)
        $("#errPrenotazione")
          .text("Devi selezionare i posti che vuoi prenotare")
          .css("color", "red");
      else {
        $("#modalBar").modal("show");
        let token = localStorage.getItem("token");
        let payload = parseJwt(token);
        let tipoAbbonamento = payload.abbonamento;
        switch (tipoAbbonamento) {
          case "standard":
            prezzoPosti = 15 * $(".buttonClicked").length;
            $(".spanPosti").html(15);
            $(".spanPopCorn").html(4);
            $(".spanCocaCola").html(2);
            break;
          case "regular":
            prezzoPosti = 10 * $(".buttonClicked").length;
            $(".spanPosti").html(10);
            $(".spanPopCorn").html(3);
            $(".spanCocaCola").html(1);
            break;
          case "platinum":
            prezzoPosti = 5 * $(".buttonClicked").length;
            $(".spanPosti").html(5);
            $(".spanPopCorn").html(2);
            $(".spanCocaCola").html(1);
            break;
          default:
            prezzoPosti = 20 * $(".buttonClicked").length;
            $(".spanPosti").html(20);
            $(".spanPopCorn").html(5);
            $(".spanCocaCola").html(2);
            break;
        }
        $(".txtPrezzoPosti").html(prezzoPosti + "€");
      }
    });
  });
  getInfoSalaFilm.fail(function (jqXHR) {
    error(jqXHR);
    $("#btnAccedi").html("Accedi");
    window.location.href = "index.html";
  });
}

function parseJwt(token) {
  let payload = token.split(".")[1];
  payload = payload.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(window.atob(payload));
}

function eseguiPagamentoPrenotazione() {
  proiezione.prezzo = prezzoTotale;
  proiezione.postiPrenotati = $(".buttonClicked").length;
  proiezione.data = $("#dataPre").html();
  proiezione.titolo = $("#titoloPre").html();
  proiezione.sala = $("#salaPre").html();
  proiezione.popcorn = $("#txtPopCorn").val();
  proiezione.cocacola = $("#txtCocaCola").val();

  $(".buttonClicked").each((index, e) => {
    vetPostiScelti.push($(e).attr("id"));
  });

  proiezione.postiScelti = vetPostiScelti;

  let prenota = sendRequestNoCallback("/api/prenota", "POST", proiezione);
  prenota.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    $("#errPrenotazione").text(serverData.msg).css("color", "green");
    $(".buttonClicked").addClass("postiPrenotati");
    $(".buttonClicked").removeClass("buttonClicked");
    $(".buttonClicked").prop("disabled", true);
    $("#errPagamento").text(serverData.msg).css("color", "green");
  });
  prenota.fail(function (jqXHR) {
    error(jqXHR);
    $("#errPrenotazione").text(jqXHR.responseText).css("color", "red");
    $("#errPagamento").text(jqXHR.responseText).css("color", "red");
  });
}

function eseguiModalBar() {
  let token = localStorage.getItem("token");
  let payload = parseJwt(token);
  let tipoAbbonamento = payload.abbonamento;
  switch (tipoAbbonamento) {
    case "standard":
      prezzoPopCorn = 4 * $("#txtPopCorn").val();
      $(".spanPopCorn").html(4);
      prezzoCocaCola = 2 * $("#txtCocaCola").val();
      $(".spanCocaCola").html(2);
      break;
    case "regular":
      prezzoPopCorn = 3 * $("#txtPopCorn").val();
      $(".spanPopCorn").html(3);
      prezzoCocaCola = 1 * $("#txtCocaCola").val();
      $(".spanCocaCola").html(1);
      break;
    case "platinum":
      prezzoPopCorn = 2 * $("#txtPopCorn").val();
      $(".spanPopCorn").html(2);
      prezzoCocaCola = 1 * $("#txtCocaCola").val();
      $(".spanCocaCola").html(1);
      break;
    default:
      prezzoPopCorn = 5 * $("#txtPopCorn").val();
      $(".spanPopCorn").html(5);
      prezzoCocaCola = 2 * $("#txtCocaCola").val();
      $(".spanCocaCola").html(2);
      break;
  }

  $(".txtPrezzoPopCorn").html(prezzoPopCorn + "€");
  $(".txtPrezzoCocaCola").html(prezzoCocaCola + "€");
  prezzoTotale = prezzoPosti + prezzoPopCorn + prezzoCocaCola;
  $(".txtPrezzoTotale").html(prezzoTotale + "€");

  $("#modalBar").modal("hide");
  $(".nas").hide();
  $("#paymentSection").show();
}
