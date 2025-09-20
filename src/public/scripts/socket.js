class Socket {
  static RESPONSE_HANDLER = [];
  constructor() {
    this.socket = null;
  }
  test(){
    console.log("Test done");
  }
  async connect(callback_after_connection = null) {
    this.socket = new WebSocket("ws://localhost:2100");        
    this.socket.addEventListener("open", () => {
      console.log("Connected to WebSocket server");
      if (callback_after_connection != null) {
        callback_after_connection();
      }
    });
    
    this.socket.addEventListener("message", (event) => {
      console.log("Message from server:", event.data);
      const response = JSON.parse(event.data);
      if (!"instruction" in response) return;
      Socket.RESPONSE_HANDLER.forEach((handler) => {
        if (handler.instruction === response.instruction) {
          handler.callback(response);
        }
      });
    });
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    } else {
      console.warn("WebSocket is not open yet");
    }
  }
  
  register_response_handler(handler) {
    if (typeof handler !== "object" || handler === null) {
      throw new Error("Handler must be a non-null object");
    }
    Socket.RESPONSE_HANDLER.forEach((handler) => {
      if (handler.instruction === response.instruction) {
        return;
      }
    });
    Socket.RESPONSE_HANDLER.push(handler);
  }
  disconnect() {}
}
export default new Socket();
