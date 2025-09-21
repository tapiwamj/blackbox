import socket from "./socket.js";
import rtcClass from "./rtc.js";
const rtc = new rtcClass(socket);
let searching = false;
let tapAgainTimeOut = null;
$("#circle").on("click", function () {
  if (searching == true) {
    const ogStatus = $("#status").html();
    $("#status").html("Tap again to disconnect");
    if (tapAgainTimeOut == null) {
      tapAgainTimeOut = setTimeout(() => {
        $("#status").html(ogStatus);
        tapAgainTimeOut = null;
      }, 5000);
    } else {
      clearTimeout(tapAgainTimeOut);
      tapAgainTimeOut = null;
      rtc.cancelPair();
    }
    return;
  }
  searching = true;
  rtc.init();
  $("#circle").removeClass("connecting connected");
  $("#circle").addClass("connecting");
});
