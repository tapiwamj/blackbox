const express = require('express');
const router = require('./routes/chat.route.js'); 
const app = express();
const nunjucks = require("nunjucks");
const port = 3000;
const path = require("path");
const socket = require("./serverSocket.js");

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.set("view engine", "njk");
nunjucks.configure(path.join(__dirname, "views"), {
  autoescape: true,
  express: app,
  watch: true,
});
// Routes
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});
app.use("/chat", router);

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    socket.start(2100);
});



