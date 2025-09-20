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
        searchInterval: null,
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
      const connection = ServerSocket.CONNECTIONS[index];
      clearInterval(connection.searchInterval);
      ServerSocket.CONNECTIONS.splice(index, 1);
    }
    console.log("Removed is: " + index);
  }
  messagesHandler(message, ws) {
    let obj;
    try {
      obj = JSON.parse(message);
    } catch (error) {
      console.error(error);
    }
    if (!("instruction" in obj)) {
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
      const start = Date.now();
      const timeout = 15000;
      const my_index = ServerSocket.CONNECTIONS.findIndex(
        (c) => c.socket === ws
      );
      const my_connection = ServerSocket.CONNECTIONS[my_index];
      my_connection.searchInterval = setInterval(() => {
        if (Date.now() - start > timeout) {
          console.log("Timeout: no pair found");
          my_connection.socket.send(
            JSON.stringify({ instruction: "nopairfound" })
          );
          clearInterval(my_connection.searchInterval);
          return;
        }
        if (my_connection.status == 1) {
          clearInterval(my_connection.searchInterval);
          return;
        }
        const pair_index = ServerSocket.CONNECTIONS.findIndex(
          (c) => c.socket != ws && c.status == 0
        );
        if (pair_index == -1) {
          return;
        }
        const pair_connection = ServerSocket.CONNECTIONS[pair_index];
        const my_uid = my_connection.uid;
        const other_uid = pair_connection.uid;
        my_connection.status = 1;
        my_connection.pair = other_uid;

        pair_connection.status = 1;
        pair_connection.pair = my_uid;
        my_connection.socket.send(
          JSON.stringify({ instruction: "createLocal" })
        );
        pair_connection.socket.send(
          JSON.stringify({ instruction: "waitForRemoteOffer" })
        );

        clearInterval(my_connection.searchInterval);
      }, 100);
      //to be removed
    }
  }
}

module.exports = new ServerSocket();
