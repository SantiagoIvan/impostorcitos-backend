require('dotenv').config();
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { RoomEvents, SocketEvents, CreateRoomDto } from "./shared";
import { RoomService } from "./services";
import { emitRoomList } from "./websockets/room.sockets";

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

  socket.on(RoomEvents.CREATE, (roomDto : CreateRoomDto) => {
    RoomService.addRoom(roomDto)
    io.emit(RoomEvents.LIST, RoomService.getRooms())
  })
});

server.listen(PORT, () => {
  console.log(`Socket.IO server escuchando en puerto ${PORT}`);
});
