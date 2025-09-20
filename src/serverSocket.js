const WebSocket = require("ws");
class ServerSocket {
  static CONNECTIONS = [];
  constructor() {
    this.wss;
  }
  getId() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + "-" + s4();
  }
  start(port) {
    this.wss = new WebSocket.Server({ port: port });
    this.wss.on("connection", (ws) => {
      ServerSocket.CONNECTIONS.push({
        uid: this.getId(),
        status: 0,
        socket: ws,
        looking_Start_time: -1,
        offer: null,
        answer: null,
        pair: null,
      });
      console.log("New client connected");
      // ws.send(
      //   JSON.stringify({
      //     instruction: "ttt",
      //   })
      // );

      // Listen for messages from client
      ws.on("message", (message) => {
        console.log(`Received: ${message}`);
        this.messagesHandler(message, ws);
        // Echo the message back to the client
      });

      // Handle client disconnect
      ws.on("close", () => {
        console.log("Client disconnected");
        this.handleClose(ws);
      });
    });
    console.log("WebSocket server is running on ws://localhost:" + port);
  }
  handleClose(ws) {
    const index = ServerSocket.CONNECTIONS.findIndex((c) => c.socket === ws);
    if (index !== -1) {
      ServerSocket.CONNECTIONS.splice(index, 1);
    }
  }
  messagesHandler(message, ws) {
    let obj;
    try {
      obj = JSON.parse(message);
    } catch (error) {
      console.error(error);
    }
    if (!"instruction" in obj) {
      return;
    }
    if (obj.instruction == "offer") {
      const index = ServerSocket.CONNECTIONS.findIndex((c) => c.socket === ws);
      const pair = ServerSocket.CONNECTIONS[index].pair;
      const pair_index = ServerSocket.CONNECTIONS.findIndex(
        (c) => c.uid == pair
      );
      ServerSocket.CONNECTIONS[pair_index].socket.send(
        JSON.stringify({
          instruction: "remoteOffer",
          offer: obj.offer,
        })
      );
    }
    if (obj.instruction == "answer") {
      const index = ServerSocket.CONNECTIONS.findIndex((c) => c.socket === ws);
      const pair = ServerSocket.CONNECTIONS[index].pair;
      const pair_index = ServerSocket.CONNECTIONS.findIndex(
        (c) => c.uid == pair
      );
      ServerSocket.CONNECTIONS[pair_index].socket.send(
        JSON.stringify({
          instruction: "remoteAnswer",
          answer: obj.answer,
        })
      );
    }
    if (obj.instruction == "lookforpair") {
      const my_index = ServerSocket.CONNECTIONS.findIndex(
        (c) => c.socket === ws
      );
      const start = Date.now();
      const timeout = 15000;
      const interval = setInterval(() => {
        if (Date.now() - start > timeout) {
          console.log("Timeout: no pair found");
          ServerSocket.CONNECTIONS[my_index].socket.send(
            JSON.stringify({ instruction: "nopairfound" })
          );
          clearInterval(interval);
          return;
        }
        // console.log(ServerSocket.CONNECTIONS);

        if (ServerSocket.CONNECTIONS[my_index].status == 1) {
          clearInterval(interval);
          return;
        }
        const indexes = [];
        ServerSocket.CONNECTIONS.forEach((c, i) => {
          if (c.status === 0 && c.socket != ws) indexes.push(i);
        });

        if (indexes.length > 0) {
          const pairindex = indexes[0]; // pick first available
          console.log(pairindex);

          const my_uid = ServerSocket.CONNECTIONS[my_index].uid;
          const other_uid = ServerSocket.CONNECTIONS[pairindex].uid;

          ServerSocket.CONNECTIONS[my_index].status = 1;
          ServerSocket.CONNECTIONS[my_index].pair = other_uid;

          ServerSocket.CONNECTIONS[pairindex].status = 1;
          ServerSocket.CONNECTIONS[pairindex].pair = my_uid;
          ServerSocket.CONNECTIONS[my_index].socket.send(
            JSON.stringify({ instruction: "createLocal" })
          );
          ServerSocket.CONNECTIONS[pairindex].socket.send(
            JSON.stringify({ instruction: "waitForRemoteOffer" })
          );

          clearInterval(interval);
        }
      }, 100);
      //to be removed
    }
  }
}

module.exports = new ServerSocket();
