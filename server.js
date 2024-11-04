const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "kanban-velidogan120.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  },
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