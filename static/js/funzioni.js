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

  $("#txtDataProiezione").attr("min", new Date());

  $('input[type="file"]').change(function (e) {
    imgName = e.target.files[0].name;
    imgFile = e.target.files[0];
  });

  $("#btnInserisciFilmModal").on("click", function () {
    $("#modalTendenza").modal("show");
  });

  /*$("#btnInserisciFilm").on("click", function () {
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
      $("#modalTendenza").modal("hide");
    });

    inserisciFilm.fail(function (jqXHR) {
      error(jqXHR);
      $("#pErrorInsFilmModal").text(jqXHR.responseText);
    });
  });*/

  $(".pollici").on("click", function (e) {
    let tendenza = 0;
    if (String(e.target.id).includes("Verde")) tendenza = 2;
    else if (String(e.target.id).includes("Giallo")) tendenza = 1;
    else tendenza = 0;

    let inserisciFilm = sendRequestNoCallback("/api/inserisciFilm", "POST", {
      titolo: $("#txtTitolo").val(),
      genere: $("#txtGenere").val(),
      durata: $("#txtDurata").val(),
      copertina: imgName,
      descrizione: $("#txtDescrizione").val(),
      tendenza: tendenza,
    });

    inserisciFilm.done(function (serverData) {
      serverData = JSON.parse(serverData);
      localStorage.setItem("token", serverData.token);
      console.log(serverData.msg);
      $("#modalTendenza").modal("hide");
    });

    inserisciFilm.fail(function (jqXHR) {
      error(jqXHR);
      $("#pErrorInsFilmModal").text(jqXHR.responseText);
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
      $("#pErrorInsSale").text(jqXHR.responseText);
    });
  });

  $("#btnInserisciProiezione").on("click", function () {
    let inserisciProiezione = sendRequestNoCallback(
      "/api/inserisciProiezione",
      "POST",
      {
        IDFilm: $("#lstTitoloFilm").val(),
        IDSala: $("#lstSalaProiezione").val(),
        DataProiezione: $("#txtDataProiezione").val(),
      }
    );

    inserisciProiezione.done(function (serverData) {
      serverData = JSON.parse(serverData);
      localStorage.setItem("token", serverData.token);
      console.log(serverData.msg);
    });

    inserisciProiezione.fail(function (jqXHR) {
      error(jqXHR);
      $("#pErrorInsProiezioni").text(jqXHR.responseText);
    });
  });
});

function loginDone() {
  let elencoFilm = sendRequestNoCallback("/api/elencoFilm", "POST", {
    genere: "",
  });
  elencoFilm.fail(function (jqXHR) {
    //Tornare alla pagina originale
    error(jqXHR);
  });
  elencoFilm.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    caricaListaFilm(serverData.dati);
  });

  let elencoSale = sendRequestNoCallback("/api/elencoSale", "POST", {
    tipoPoltrone: "",
  });
  elencoSale.fail(function (jqXHR) {
    //Tornare alla pagina originale
    error(jqXHR);
  });
  elencoSale.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    caricaListaSale(serverData.dati);
  });
}

function logout() {
  window.location.href = "index.html";
}

function caricaListaFilm(data) {
  let lista = $("#lstTitoloFilm");
  lista.html("");
  for (let i = 0; i < data.length; i++) {
    let newOpt = $("<option>");
    lista.append(newOpt);
    newOpt.html(data[i].titolo).val(data[i]._id);
  }
}

function caricaListaSale(data) {
  let lista = $("#lstSalaProiezione");
  lista.html("");
  for (let i = 0; i < data.length; i++) {
    let newOpt = $("<option>");
    lista.append(newOpt);
    newOpt.html(data[i].nome).val(data[i]._id);
  }
}
