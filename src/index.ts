require('dotenv').config();
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { defaultRooms, defaultMessages } from "./db/init";
import cors from "cors";
import { RoomEvents, Room, SocketEvents } from "./shared";

const port = process.env.PORT || 4000

const app = express();

app.use(cors({
    origin: "http://localhost:3000",  // Next.js
    credentials: true
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // o especifica tu dominio de Next
  }
});

// Lista de rooms en memoria
export const rooms: any[] = defaultRooms
export const messages: any[] = defaultMessages


io.on(SocketEvents.CONNECTION, (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Enviar rooms al conectarse
  socket.emit(RoomEvents.LIST, rooms);

  socket.on(RoomEvents.CREATE, (room : Room) => {
    console.log(room)

    rooms.push(room)
    socket.emit(RoomEvents.LIST, rooms);
  })
});

server.listen(port, () => {
  console.log(`Socket.IO server escuchando en puerto ${port}`);
});
