class RTC {
  constructor(socket) {
    this.socket = socket;
    this.register_socket_handlers();
  }
  register_socket_handlers() {
    this.socket.register_response_handler({
      instruction: "ttt",
      callback: function () {
        console.log("csdcdscd cdsd");
      },
    });
  }
  async getAudioStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted:", stream);
      return stream;
    } catch (err) {
      if (err.name === "NotAllowedError") {
        console.error("Permission denied: user blocked microphone access.");
      } else if (err.name === "NotFoundError") {
        console.error("No microphone found on this device.");
      } else if (err.name === "NotReadableError") {
        console.error("Microphone is already in use by another application.");
      } else {
        console.error("Error accessing microphone:", err);
      }
      return null;
    }
  }
  async init() {
    // const stream = await getAudioStream();
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.socket.connect(() => {
      this.socket.send(
        JSON.stringify({
          instruction: "offer",
          offer: offer,
        })
      );
    });

    // stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    // pc.ontrack = (event) => {
    //   const audio = document.createElement("audio");
    //   audio.srcObject = event.streams[0];
    //   audio.autoplay = true;
    //   document.body.appendChild(audio);
    // };
  }
}

export default RTC;
