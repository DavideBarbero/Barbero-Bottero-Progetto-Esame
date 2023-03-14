"use strict";

$(() => {
  $("#filtroGenere").multiselect();

  let elencoFilm = sendRequestNoCallback("/api/elencoFilm", "POST", {
    genere: "",
  });
  elencoFilm.fail(function (jqXHR) {
    //Tornare alla pagina originale
    $("#btnAccedi").html("Accedi");
    //error(jqXHR);
  });
  elencoFilm.done(function (serverData) {
    serverData = JSON.parse(serverData);
    localStorage.setItem("token", serverData.token);
    $("#btnAccedi").html("Logout");
    creaFilm(serverData.dati);
  });

  $("#filtroGenere").on("change", function () {
    let vetGeneri = [];
    let vetOption = $("#filtroGenere").children("option").toArray();
    for (let i = 0; i < vetOption.length; i++) {
      if (vetOption[i].selected) vetGeneri.push(vetOption[i].value);
    }

    elencoFilm = sendRequestNoCallback("/api/elencoFilm", "POST", {
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
  console.log(film);
}
