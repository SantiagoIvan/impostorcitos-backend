require('dotenv').config();
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { RoomEvents, Room, SocketEvents, CreateRoomDto } from "./shared";
import { RoomService } from "./services";
import { emitRoomList } from "./websockets/room.sockets";

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

io.on(SocketEvents.CONNECTION, (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Enviar rooms al conectarse
  emitRoomList(socket)

  socket.on(RoomEvents.CREATE, (roomDto : CreateRoomDto) => {
    RoomService.addRoom(roomDto)
    emitRoomList(socket)
  })
});

server.listen(port, () => {
  console.log(`Socket.IO server escuchando en puerto ${port}`);
});
