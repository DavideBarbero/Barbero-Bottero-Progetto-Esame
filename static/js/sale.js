"use strict";

$(() => {
  $(window).on("load", function () {
    $("#preloader").remove();
  });

  sale();

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
});

function sale() {
  let elencoSale = sendRequestNoCallback("/api/elencoSale", "POST", {
    tipoPoltrone: "",
  });
  elencoSale.done(function (serverData) {
    serverData = JSON.parse(serverData);
    creaSale(serverData.dati);
  });
  elencoSale.fail(function (jqXHR) {
    //Tornare alla pagina originale
    error(jqXHR);
  });
}

function logout() {
  //window.location.href = "index.html";
}

function creaSale(sale) {
  $("#elencoSale").html("");
  for (let i = 0; i < sale.length; i++) {
    let cardSala =
      "<center><div class='card " +
      sale[i].tipoPoltrone +
      " col-6 mb-2' style='border-radius: 15px; display:inline-block; '><div class='card-body p-4'><div class='d-flex text-white'><div class='flex-shrink-0'></div><div class='flex-grow-1 ms-3'><h5 class='mb-3'>" +
      sale[i].nome +
      "</h5><div class='d-flex justify-content-center rounded-3 p-2 mb-2 text-light' style='background-color: black; opacity:0.7;'><div><p class='small text-muted mb-1'>Numero posti</p><p class='mb-0'>" +
      sale[i].posti +
      "</p></div><div class='px-3'><p class='small text-muted mb-1'>Tipo poltrone</p><p class='mb-0'>" +
      sale[i].tipoPoltrone +
      "</p></div><div class='px-3'><p class='small text-muted mb-1'>Dimensioni schermo</p><p class='mb-0'>" +
      sale[i].dimensioniSchermo +
      "</p></div></div></div></div></div></div></center>";

    /*let cardSala =
      "<div class='profile-card-6 col-6'><img src='images/sale/" +
      sale[i].tipoPoltrone +
      ".jpg'><div class='profile-name'>" +
      sale[i].nome +
      "</div><div class='profile-overview'><div class='profile-overview'><div class='row text-center'><div class='col-xs-4'><h3>" +
      sale[i].posti +
      "</h3><p>Numero Posti</p></div><div class='col-xs-4'><h3>" +
      sale[i].tipoPoltrone +
      "</h3><p>Tipo poltrone</p></div><div class='col-xs-4'><h3>" +
      sale[i].dimensioniSchermo +
      "</h3><p>Dimensioni schermo</p></div></div></div></div></div>";*/

    $("#elencoSale").append(cardSala);
  }
}
