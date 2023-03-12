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
    $("#filtroGenere").options.forEach((option) => {
      if (option.prop("selected")) vetGeneri.push(option.val());
    });
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
