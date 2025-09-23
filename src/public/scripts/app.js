import socket from "./socket.js";
import rtcClass from "./rtc.js";
import animator from "./animator.js";
import RTC from "./rtc.js";
const userVal = {
  spawnInterval: null
}
const rtc = new rtcClass(socket, animator);
let tapAgainTimeOut = null;
$("#circle").on("click", function () {
  if (RTC.SEARCHING == true) {
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
  RTC.SEARCHING = true;
  rtc.init();
  $("#circle").removeClass("connecting connected");
  $("#circle").addClass("connecting");
});

