require('dotenv').config();
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { SocketEvents } from "./lib";
import { emitRoomList, registerAllRoomEvents, registerMessageEvents } from "./websockets";

const PORT = process.env.PORT || 4000
export const GENERAL_CHAT_CHANNEL = process.env.GENERAL_CHAT_CHANNEL || "GENERAL"
export const MIN_PLAYERS_QUANTITY = process.env.MIN_PLAYERS_QUANTITY || 3
const app = express();

app.use(cors({
    origin: "*",
    credentials: true
}));

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*", // o especifica tu dominio de Next
  }
});

io.on(SocketEvents.CONNECTION, (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on(SocketEvents.DISCONNECT, () => {
    handleDisconnect(socket, io)
  })
  // Enviar rooms al conectarse
  emitRoomList(socket)

  // Registramos a los eventos de los rooms
  registerAllRoomEvents(socket, io)
  registerMessageEvents(socket, io)
});

server.listen(PORT, () => {
  console.log(`Socket.IO server escuchando en puerto ${PORT}`);
});

const handleDisconnect = (socket: Socket, io: Server) => {
  console.log("Hasta siempre, soldado")
}