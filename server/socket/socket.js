import { Server } from "socket.io";
import http from 'http';
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    }
});

export const getRecipientSocketId = (recipientId) => {
    return userSocketMap[recipientId]
}

export const getSenderSocketId = (senderId) => {
    return userSocketMap[senderId]
}

const userSocketMap = {};

io.on('connection', (socket) => {

    const userId = socket.handshake.query.userId;
    const ownerId = socket.handshake.query.ownerId;

    if (userId) {
        userSocketMap[userId] = socket.id;
    }
    if (ownerId) {
        userSocketMap[ownerId] = socket.id;
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {

        if (userSocketMap[userId] === socket.id) {
            delete userSocketMap[userId];
        } else if (userSocketMap[ownerId] === socket.id) {
            delete userSocketMap[ownerId];
        }

        setTimeout(() => {
            io.emit('getOnlineUsers', Object.keys(userSocketMap));
        }, 1000);
    });
});


export { io, server, app };
