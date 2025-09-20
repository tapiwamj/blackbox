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

        // Echo the message back to the client
        ws.send(
          JSON.stringify({
            instruction: "",
          })
        );
      });

      // Handle client disconnect
      ws.on("close", () => {
        console.log("Client disconnected");
      });
    });
    console.log("WebSocket server is running on ws://localhost:" + port);
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
    // if (obj.instruction == "offer") {
    //   const timestampNs = process.hrtime.bigint();
    //   const index = ServerSocket.CONNECTIONS.findIndex((c) => c.socket === ws);
    //   connection[index].looking_Start_time = timestampNs;
    //   connection[index].offer = obj.offer;
    //   // connection[index].status = 1;
    // }
    if (obj.instruction == "lookforpair") {
      const my_index = ServerSocket.CONNECTIONS.findIndex(
        (c) => c.socket === ws
      );
      while (true) {
        if (ServerSocket.CONNECTIONS[my_index].status == 1) {
          break;
        }
        const indexes = [];
        ServerSocket.CONNECTIONS.forEach((c, i) => {
          if (c.status === 0) indexes.push(i);
        });
        if (indexes.length > 0) {
          ServerSocket.CONNECTIONS[my_index].status = 1;
        }
        for (const pairindex of indexes) {
          if (ServerSocket.CONNECTIONS[pairindex].status == 0) {
            const master = ServerSocket.CONNECTIONS[my_index].uid;
            ServerSocket.CONNECTIONS[my_index].status = 1;
            ServerSocket.CONNECTIONS[my_index].pair = pairindex;
            ServerSocket.CONNECTIONS[my_index].master = master;
            ServerSocket.CONNECTIONS[pairindex].status = 1;
            ServerSocket.CONNECTIONS[pairindex].pair = my_index;
            ServerSocket.CONNECTIONS[my_index].master = master;
            ServerSocket.CONNECTIONS[my_index].socket.send(JSON.stringify({
              
            }))
            //add break point
          }
        }
      }
    }
  }
}

module.exports = new ServerSocket();
