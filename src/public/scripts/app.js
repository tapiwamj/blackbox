import socket from "./socket.js";
import rtcClass from "./rtc.js";

console.log(typeof socket);

const rtc = new rtcClass(socket);
rtc.init();