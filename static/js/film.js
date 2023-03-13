"use strict";

$(() => {
  $("#filtroGenere").multiselect();

  let elencoFilm = sendRequestNoCallback("/api/elencoFilm", "POST", {
    genere: "",
  });
  elencoFilm.fail(function (jqXHR) {
    error(jqXHR);
  });
  elencoFilm.done(function (serverData) {
    console.log(serverData);
  });

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
      console.log(serverData);
    });
  });
});
