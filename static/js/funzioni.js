"use strict";
let imgName, imgFile;

$(() => {
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

  $('input[type="file"]').change(function (e) {
    imgName = e.target.files[0].name;
    imgFile = e.target.files[0];
  });

  $("#btnInserisciFilm").on("click", function () {
    let inserisciFilm = sendRequestNoCallback("/api/inserisciFilm", "POST", {
      titolo: $("#txtTitolo").val(),
      genere: $("#txtGenere").val(),
      durata: $("#txtDurata").val(),
      copertina: imgName,
      descrizione: $("#txtDescrizione").val(),
      tendenza: 0,
    });

    inserisciFilm.done(function (serverData) {
      serverData = JSON.parse(serverData);
      localStorage.setItem("token", serverData.token);
      console.log(serverData.msg);
    });

    inserisciFilm.fail(function (jqXHR) {
      error(jqXHR);
    });
  });

  $("#btnInserisciSala").on("click", function () {
    let inserisciSala = sendRequestNoCallback("/api/inserisciSala", "POST", {
      nome: $("#txtNomeSala").val(),
      posti: $("#txtNPosti").val(),
      dimensioniSchermo: $("#txtDimSchermo").val(),
      tipoPoltrone: $("#txtTipoPoltrone").val(),
    });

    inserisciSala.done(function (serverData) {
      serverData = JSON.parse(serverData);
      localStorage.setItem("token", serverData.token);
      console.log(serverData.msg);
    });

    inserisciSala.fail(function (jqXHR) {
      error(jqXHR);
    });
  });
});

function loginDone() {}

function logout() {
  window.location.href = "index.html";
}
