const express = require("express");
const https = require("https");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const app = express();

const options = {
  key: fs.readFileSync("path/to/your/server.key"), // SSL private key
  cert: fs.readFileSync("path/to/your/server.crt") // SSL certificate
};

const server = https.createServer(options,app);
const io = socketIo(server, {
  cors: {
    origin: "https://kanban-velidogan120.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket"],
  addTrailingSlash: false

});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("commentAdd", (data) => {
    console.log(data)
    io.emit("commentAdded", data);
  });

  socket.on("commentDelete", (data) => {
    console.log(data)
    io.emit("commentDeleted", data);
  });

  socket.on("commentVote", (data) => {
    console.log(data)
    io.emit("commentVoted", data);
  });

  socket.on("commentStep", (data) => {
    console.log(data)
    io.emit("commentStepOver", data);
  });

  socket.on("btnDisable", (data) => {
    console.log(data)
    io.emit("btnDisabled", data);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));