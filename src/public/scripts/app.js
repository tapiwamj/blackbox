import socket from "./socket.js";
import rtcClass from "./rtc.js";
const rtc = new rtcClass(socket);
let searching = false;
$('#circle').on('click', function () {
    rtc.init();
})
