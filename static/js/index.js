"use strict";

$(() => {
  let insert = sendRequestNoCallback("/api/registraUtente", "GET", {});
  insert.fail(function (jqXHR) {
    error(jqXHR);
  });
  insert.done(function (serverData) {
    console.log(serverData);
  });
});
