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
    if (localStorage.getItem("proiezione") != null) loginDone();
    else logout();
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
  let proiezioneID = localStorage.getItem("proiezione");
  proiezioneID = parseInt(proiezioneID.split("-")[1]);

  let getProiezione = sendRequestNoCallback("/api/getProiezione", "POST", {
    _id: proiezioneID,
  });
  getProiezione.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    caricaProiezione(serverData.dati);
  });
  getProiezione.fail(function (jqXHR) {
    error(jqXHR);
    $("#btnAccedi").html("Accedi");
    window.location.href = "index.html";
  });
}

function caricaProiezione(proiezione) {
  console.log(proiezione);
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
    $("#imgPre").prop("src", "images/copertine/" + info.copertina);
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

      if (proiezione.postiOccupati[i] != 0) {
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
      let prenota = sendRequestNoCallback("/api/prenota", "POST", proiezione);
      prenota.done(function (serverData) {
        serverData = JSON.parse(serverData);
        localStorage.setItem("token", serverData.token);
        $("#errPrenotazione").text(serverData.msg).css("color", "green");
      });
      prenota.fail(function (jqXHR) {
        error(jqXHR);
        $("#errPrenotazione").text(jqXHR.responseText).css("color", "red");
      });
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