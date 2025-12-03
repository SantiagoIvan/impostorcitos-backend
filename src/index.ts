import express from "express";
import http from "http";
import { Server } from "socket.io";
import Room from "./types/room";
import Message from "./types/message";
import { defaultRooms, defaultMessages } from "./db/init";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // o especifica tu dominio de Next
  }
});

// Lista de rooms en memoria
const rooms: Room[] = defaultRooms
const messages: Message[] = defaultMessages

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Enviar rooms al conectarse
  socket.emit("rooms:list", rooms);
  socket.emit("messages:list", rooms);
  /*
  // Crear un room
  socket.on("rooms:create", (roomName) => {
    const room = { name: roomName, id: Date.now() };
    //rooms.push(rooms);

    // Broadcast a todos
    io.emit("rooms:list", rooms);
  });

  // Unirse a un room
  socket.on("room:join", (roomId) => {
    socket.join(roomId);
  });

  // Recibir mensaje
  socket.on("chat:message", ({ roomId, message }) => {
    io.to(roomId).emit("chat:message", {
      message,
      sender: socket.id,
      timestamp: Date.now(),
    });
  });*/
});

server.listen(4000, () => {
  console.log("Socket.IO server escuchando en puerto 4000");
});
