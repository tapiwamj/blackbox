
class RTC {
  static FAKER = true;
  static SEARCHING = false;
  constructor(socket, animator) {
    this.socket = socket;
    this.animator = animator;
    this.register_socket_handlers();
  }
  register_socket_handlers() {
    //sending offer
    this.socket.register_response_handler({
      instruction: "createLocal",
      callback: this.createOffer.bind(this),
    });
    this.socket.register_response_handler({
      instruction: "faker",
      callback: this.handleFakerMessage.bind(this),
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
    this.socket.register_response_handler({
      instruction: "hangup",
      callback: this.hangupFromPair.bind(this),
    });
  }
  hangupFromPair() {
    RTC.SEARCHING = false;
    this.pc.close();
    this.pc = null;
    this.showHungupUI();
  }
  showHungupUI() {
    $("#circle").removeClass("connecting connected");
    $("#status").html("Ready to connect.");
    this.animator.startAnim();
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
  async handleFakerMessage() {
    RTC.FAKER = true;
  }
  fakerTrue() {
    RTC.FAKER = true;
  }
  async startMicAnimation(stream) {
    const circle = document.getElementById("circle");
    await Tone.start(); // resume AudioContext on user click
    const mic = new Tone.UserMedia();
    mic._stream = stream;
    mic._mediaStream = stream;
    const source = Tone.context.createMediaStreamSource(stream);
    const inputNode = new Tone.Gain();
    source.connect(inputNode.input);
    const meter = new Tone.Meter();
    inputNode.connect(meter);
    mic.connect(meter);
    function animate() {
      const level = meter.getValue(); // dB value
      const norm = Math.min(Math.max((level + 60) / 60, 0), 1);
      let scale = Math.max(1, 1 + norm); // 1–2
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
  cancelPair() {
    this.pc.close();
    this.pc = null;
    RTC.SEARCHING = false;
    this.socket.send(
      JSON.stringify({
        instruction: "hangup",
      })
    );
    this.showHungupUI();
  }
  async init() {
    $("#status").html("Finding pair...");
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
    this.pc.onconnectionstatechange = () => {
      console.log("Connection state:", this.pc.connectionState);
      if (
        this.pc.connectionState === "disconnected" ||
        this.pc.connectionState === "failed"
      ) {
        $("#status").html("Host has left");
        console.log("Peer disconnected!");
        this.hangupFromPair();
      }
      if (this.pc.connectionState === "connecting") {
        $("#status").html("Pair found, connecting...");
      }
      if (this.pc.connectionState === "connected") {
        $("#status").html("Connected");
        $("#circle").removeClass("connecting connected");
        $("#circle").addClass("connected");
        this.animator.stopAnim();
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
      this.startMicAnimation(event.streams[0]);
    };
  }
  async fakeMicFromFile(fileUrl = "reality.mp3") {
    const audioContext = new AudioContext();
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
