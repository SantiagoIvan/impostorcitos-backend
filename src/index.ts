require('dotenv').config();
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import {  SocketEvents } from "./lib";
import { emitRoomList, registerAllRoomEvents, registerMessageEvents } from "./websockets";
import { ConsoleLogger } from "./logger";
import { startCleanupJobs } from "./jobs";
import authRoutes from "./routes/auth.routes"
import roomRoutes from "./routes/room.routes"
import pingRoutes from "./routes/ping.route"
import reportRoute from "./routes/report.route"
import { errorMiddleware } from "./middleware/error.middleware";
import { userManager } from "./domain/user/UserManager";
import { userService } from "./services";
import { FileLogger } from "./logger/FileLogger";
import { delayMiddleware } from "./middleware/delay.middleware";

const PORT = process.env.PORT || 4000
export const GENERAL_CHAT_CHANNEL = process.env.GENERAL_CHAT_CHANNEL || "GENERAL"
export const MIN_PLAYERS_QUANTITY = process.env.MIN_PLAYERS_QUANTITY || 3
export const MAX_MESSAGE_LENGTH = parseInt(process.env.MAX_MESSAGE_LENGTH || "80")
export const CLEANUP_JOB_INTERVAL = parseInt(process.env.CLEANUP_JOB_INTERVAL || "60000")
export const ROOM_TTL = parseInt(process.env.ROOM_TTL || "300000")
export const GAME_TTL = parseInt(process.env.GAME_TTL || "300000")
export const MESSAGE_TTL = parseInt(process.env.MESSAGE_TTL || "300000")
export const USER_TTL = parseInt(process.env.USER_TTL || "300000")
const app = express();
const logger = new ConsoleLogger("SERVER")

app.use(cors({
    origin: "*",
    credentials: true
}));

//app.use(delayMiddleware(1000));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes)
app.use("/api/ping", pingRoutes)
app.use("/api/report", reportRoute)
app.use(errorMiddleware);

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*", // o especifica tu dominio de Next
  }
});

server.listen(Number(PORT), "127.0.0.1",() => {
  logger.info(`Socket.IO server escuchando en puerto ${PORT}`);
});

io.on(SocketEvents.CONNECTION, (socket) => {
  const {username} = socket.handshake.auth 
  // Esto solamente ocurre durante el handshake
  // En la version posta, aca deberia enviar el JWT recibido durante el login y desencriptarlo para obtener el username, pero bueno,
  // No voy a agregar por el momento el jwt me parece una banda
  logger.info(`Cliente conectado: ${username}. Ultima version test`)

  let user = userManager.getUserByUsername(username)
  if(!user) {
    logger.warn(`User ${username} not found`)
    // Agregarlo a la lista de usuarios
    user = userManager.addUser(username)
  }

  user.setSocket = socket
  
  // Enviar rooms al conectarse
  //emitRoomList(socket)

  // Registramos a los eventos de los rooms
  registerAllRoomEvents(socket)
  registerMessageEvents(socket)
  
  
  socket.on(SocketEvents.DISCONNECT, () => {
    logger.warn("Se desconecto ", socket.handshake.auth.username)
    const user = userManager.getUserBySocketId(socket.id)
    if(user) userService.handleDisconnect(user)
  })
});

startCleanupJobs()