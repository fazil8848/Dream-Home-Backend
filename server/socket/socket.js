import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors"; // Import the cors middleware

const app = express();
app.use(cors()); // Use the cors middleware
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.USER_BASE_URl,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});
export const getRecipientSocketId = (recipientId) => {
  return userSocketMap[recipientId];
};

export const getSenderSocketId = (senderId) => {
  return userSocketMap[senderId];
};

const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  const ownerId = socket.handshake.query.ownerId;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }
  if (ownerId) {
    userSocketMap[ownerId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
    } else if (userSocketMap[ownerId] === socket.id) {
      delete userSocketMap[ownerId];
    }

    setTimeout(() => {
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }, 1000);
  });
});

export { io, server, app };
