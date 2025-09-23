
# Black Box Voice Chat

Black Box Voice Chat is a real-time random voice chat web application, similar to Omegle, allowing users to connect and talk to strangers instantly. It uses WebRTC for peer-to-peer voice streaming and WebSockets for signaling.

## Features

- Random voice connection with strangers
- Real-time voice streaming using WebRTC
- Simple and interactive UI with pulsating connection animation
- Automatic pair searching and connection handling
- Fallback audio “faker” for testing without a microphone


## Tech Stack

**Client:** SCSS, HTML, JavaScript, Jquery

**Server:** Node, Express, WS(WebSockets)

**WebRTC:** Peer-to-peer audio streaming

**Animations:** Tone.js for microphone input visualization


## Installation

1. Clone the repository 

```bash
  git clone https://github.com/tapiwamj/blackbox.git
  cd black-box-voice-chat
```
2. Start the app 

```bash
  node app.js
```
    
## Usage/Examples

1. Click the circle to start searching for a random voice connection
2. When paired, your microphone audio will be sent to the other user, and theirs will play for you.
3. Click the circle again to disconnect or cancel the pairing search.


## How it works

1. **Pairing:** Users connect to the WebSocket server and search for an available peer.
2. **WebRTC Negotiation:**
- createOffer → send to peer → createAnswer
- Exchange ICE candidates to establish the peer-to-peer connection
3. **Audio Streaming:** The peer connection streams microphone audio to the other user.Tone.js provides real-time microphone animation effects.
4. **Disconnecting:** Either user can hang up, resetting the UI and connection state.
## Notes

- For testing without a microphone, the app can use a pre-recorded audio file as a fake input.
- The WebSocket server handles all signaling logic, pairing users, and relaying SDP/ICE messages.
## License

[MIT](https://choosealicense.com/licenses/mit/)

