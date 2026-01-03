require('dotenv').config();
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { RoomEvents, SocketEvents } from "./lib";
import { emitRoomList, registerAllRoomEvents, registerMessageEvents } from "./websockets";
import { gameManager, roomManager } from "./domain";
import { ConsoleLogger } from "./logger";
import { toRoomDTOArray } from "./mappers";
import { startCleanupJobs } from "./jobs";
import authRoutes from "./routes/auth.routes"
import roomRoutes from "./routes/room.routes"
import { errorMiddleware } from "./middleware/error.middleware";
import { userManager } from "./domain/user/UserManager";

const PORT = process.env.PORT || 4000
export const GENERAL_CHAT_CHANNEL = process.env.GENERAL_CHAT_CHANNEL || "GENERAL"
export const MIN_PLAYERS_QUANTITY = process.env.MIN_PLAYERS_QUANTITY || 3
export const MAX_MESSAGE_LENGTH = parseInt(process.env.MAX_MESSAGE_LENGTH || "80")
export const CLEANUP_JOB_INTERVAL = parseInt(process.env.CLEANUP_JOB_INTERVAL || "60000")
export const ROOM_TTL = parseInt(process.env.ROOM_TTL || "300000")
export const GAME_TTL = parseInt(process.env.GAME_TTL || "300000")
export const MESSAGE_TTL = parseInt(process.env.MESSAGE_TTL || "300000")
const app = express();
const logger = new ConsoleLogger("SERVER")

app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(express.json());
app.use(errorMiddleware);
app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes)

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*", // o especifica tu dominio de Next
  }
});

server.listen(PORT, () => {
  logger.info(`Socket.IO server escuchando en puerto ${PORT}`);
});

io.on(SocketEvents.CONNECTION, (socket) => {
  const {username} = socket.handshake.auth 
  // Esto solamente ocurre durante el handshake
  // En la version posta, aca deberia enviar el JWT recibido durante el login y desencriptarlo para obtener el username, pero bueno,
  // No voy a agregar por el momento el jwt me parece una banda
  logger.info(`Cliente conectado: ${username}`)

  const user = userManager.getUserByUsername(username)
  if(!user) {
    logger.error(`User ${username} not found`)
    return
  }

  user.setSocket = socket
  
  socket.on(SocketEvents.DISCONNECT, () => {
    handleDisconnect(socket, io)
  })
  // Enviar rooms al conectarse
  emitRoomList(socket)

  // Registramos a los eventos de los rooms
  registerAllRoomEvents(socket, io)
  registerMessageEvents(socket)
});


const handleDisconnect = (socket: Socket, io: Server) => {
  logger.info("A player has left the game")
  socket.removeAllListeners()

  let playerName = ""
  // Obtengo al jugador del UserManager
  const user = userManager.getUserBySocketId(socket.id)
  if(!user){
    logger.error(`User Not Found`)
    return
  }

  // Me fijo si esta en una sala, para eliminarlo de ahi y volver a emitir el evento de lista a todos los clientes
  const roomId = user.getRoomId()
  if(roomId){
    const roomFound = roomManager.getRoomById(roomId)
    if(!roomFound) {
      logger.error("Sala no encontrada")
      return
    }
    
    logger.info(`El jugador ${playerName} estaba en la sala ${roomId}. Actualizando lista de salas a los clientes...`)
    roomFound.removePlayer(playerName)
    io.emit(RoomEvents.LIST, toRoomDTOArray(roomManager.getRooms()))
    logger.info(`Lista actualizada en los clietes`)
  }

  // Me fijo si esta en una partida
  const gameId = user.getGameId()
  if(gameId){
    const gameFound = gameManager.getGameById(gameId)
    if(!gameFound) {
      logger.error("Game no encontrada")
      return
    }

    logger.info(`Encontramos al jugador ${playerName} en ${gameId}, vamos a ver si sigue la partida y reiniciar la ronda o terminarla.`)
    gameManager.handlePlayerDisconnected(playerName, gameFound)
  }
  userManager.removeUser(user.id)
  logger.info("Hasta siempre, soldado")
}

startCleanupJobs()