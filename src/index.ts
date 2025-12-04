require('dotenv').config();
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { SocketEvents } from "./shared";
import { emitRoomList, registerAllRoomEvents } from "./websockets/room.sockets";
import { registerAllMessageEvents } from "./websockets/message.sockets";

const PORT = process.env.PORT || 4000

const app = express();

app.use(cors({
    origin: "*",
    credentials: true
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // o especifica tu dominio de Next
  }
});

io.on(SocketEvents.CONNECTION, (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Enviar rooms al conectarse
  emitRoomList(socket)

  // Registramos a los eventos de los rooms
  registerAllRoomEvents(socket, io)
  registerAllMessageEvents(socket, io)
});

server.listen(PORT, () => {
  console.log(`Socket.IO server escuchando en puerto ${PORT}`);
});
