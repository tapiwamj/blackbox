class RTC {
  static FAKER = false;
  constructor(socket) {
    this.socket = socket;
    this.register_socket_handlers();
  }
  register_socket_handlers() {
    //sending offer
    this.socket.register_response_handler({
      instruction: "createLocal",
      callback: this.createOffer.bind(this),
    });
    this.socket.register_response_handler({
      instruction: "remoteOffer",
      callback: this.createAnswer.bind(this),
    });
    //received offer
    this.socket.register_response_handler({
      instruction: "remoteAnswer",
      callback: this.handleAnswer.bind(this),
    });
    //ice candidate
    this.socket.register_response_handler({
      instruction: "icecandidate",
      callback: this.handleICE.bind(this),
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
  async startMicAnimation() {
    const circle = document.getElementById("circle");
    await Tone.start(); // resume AudioContext on user click
    const mic = new Tone.UserMedia();
    await mic.open(); // ask for permission
    const meter = new Tone.Meter();
    mic.connect(meter);
    function animate() {
      const level = meter.getValue(); // dB value
      const norm = Math.min(Math.max((level + 60) / 60, 0), 1);
      const scale = 1 + norm; // 1–2
      circle.style.transform = `scale(${scale})`;
      requestAnimationFrame(animate);
    }
    animate();
  }
  async handleICE(response) {
    try {
      const remoteCandidate = response.candidate;
      await this.pc.addIceCandidate(remoteCandidate);
      console.log("Added ICE candidate:", remoteCandidate);
    } catch (e) {
      console.error("Error adding ICE candidate:", e);
    }
  }
  async createOffer() {
    RTC.FAKER = true;
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.socket.send(
      JSON.stringify({
        instruction: "offer",
        offer: offer.sdp,
      })
    );
    console.log("Offer sent");
  }
  async handleAnswer(response) {
    await this.pc.setRemoteDescription({
      type: "answer",
      sdp: response.answer,
    });
    console.log("Answer sorted");
  }
  async createAnswer(response) {
    await this.pc.setRemoteDescription({ type: "offer", sdp: response.offer });
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    this.socket.send(
      JSON.stringify({
        instruction: "answer",
        answer: answer.sdp,
      })
    );
    console.log("Answer created");
  }
  async init() {
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.send(
          JSON.stringify({
            instruction: "icecandidate",
            candidate: event.candidate,
          })
        );
      }
    };
    let stream;
    if (RTC.FAKER == true) {
      stream = await this.fakeMicFromFile();
    } else {
      stream = await this.getAudioStream();
    }
    // const
    this.socket.connect(() => {
      console.log("Looking for pair");
      this.socket.send(
        JSON.stringify({
          instruction: "lookforpair",
        })
      );
    });
    console.log("Tracks:", stream.getTracks());
    stream.getTracks().forEach((track) => this.pc.addTrack(track, stream));
    this.pc.ontrack = (event) => {
      console.log("Playing");

      const audio = document.getElementById("audioSrc");
      audio.srcObject = event.streams[0];
      audio.play().catch((err) => console.error("Play blocked:", err));
      audio.autoplay = true;
    };
  }
  async fakeMicFromFile(fileUrl = "reality.mp3") {
    const audioContext = new AudioContext();
    // Load audio file into <audio>
    const audio = new Audio(fileUrl);
    audio.crossOrigin = "anonymous"; // if needed
    audio.loop = true; // optional

    // Create source and destination
    const source = audioContext.createMediaElementSource(audio);
    // source.connect(audioContext.destination); // so you hear it too
    const destination = audioContext.createMediaStreamDestination();

    // Connect audio to destination
    source.connect(destination);
    // Start playing
    await audio.play();
    // This stream behaves like a microphone
    return destination.stream;
  }
}

export default RTC;
