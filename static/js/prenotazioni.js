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

    for (let i = 0; i < info.posti; i++) {
      let button = $("<button id='" + i + "' ></button>");

      if (proiezione.postiOccupati[i] == 1) {
        button.prop("disabled", true);
        button.addClass("posto1");
      }

      $(".seat").append(button);

      button.on("click", function () {
        if (
          button.attr("class") == undefined ||
          button.attr("class") != "buttonClicked"
        )
          button.addClass("buttonClicked");
        else button.removeClass("buttonClicked");
      });
    }
  });
  getInfoSalaFilm.fail(function (jqXHR) {
    error(jqXHR);
    $("#btnAccedi").html("Accedi");
    window.location.href = "index.html";
  });
}
