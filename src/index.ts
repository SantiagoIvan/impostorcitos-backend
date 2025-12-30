require('dotenv').config();
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { GameEvents, RoomEvents, SocketEvents } from "./lib";
import { emitRoomList, registerAllRoomEvents, registerMessageEvents } from "./websockets";
import { gameManager, Game, Player, roomManager, Room } from "./domain";
import { ConsoleLogger } from "./logger";
import { toRoomDTOArray } from "./mappers";
import { startCleanupJobs } from "./jobs";

const PORT = process.env.PORT || 4000
export const GENERAL_CHAT_CHANNEL = process.env.GENERAL_CHAT_CHANNEL || "GENERAL"
export const MIN_PLAYERS_QUANTITY = process.env.MIN_PLAYERS_QUANTITY || 3
export const MAX_MESSAGE_LENGTH = parseInt(process.env.MAX_MESSAGE_LENGTH || "80")
export const CLEANUP_JOB_INTERVAL = parseInt(process.env.CLEANUP_JOB_INTERVAL || "60000")
export const MAX_IDLE_TIME = parseInt(process.env.CLEANUP_JOB_INTERVAL || "300000")
const app = express();
const logger = new ConsoleLogger("SERVER")

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

server.listen(PORT, () => {
  logger.info(`Socket.IO server escuchando en puerto ${PORT}`);
});

io.on(SocketEvents.CONNECTION, (socket) => {
  logger.info("Cliente conectado")

  socket.on(SocketEvents.DISCONNECT, () => {
    handleDisconnect(socket, io)
  })
  // Enviar rooms al conectarse
  emitRoomList(socket)

  // Registramos a los eventos de los rooms
  registerAllRoomEvents(socket, io)
  registerMessageEvents(socket, io)
});


const handleDisconnect = (socket: Socket, io: Server) => {
  logger.info("A player has left the game")
  socket.removeAllListeners(RoomEvents.CREATE)
  socket.removeAllListeners(RoomEvents.JOIN)
  socket.removeAllListeners(RoomEvents.LEAVE)
  socket.removeAllListeners(RoomEvents.READY)
  socket.removeAllListeners(RoomEvents.START_GAME)
  socket.removeAllListeners(GameEvents.PLAYER_READY)

  let playerName = ""
  // Me fijo si esta en una sala, para eliminarlo de ahi y volver a emitir el evento de lista a todos los clientes
  const roomFound = roomManager.getRooms().find((room: Room) => 
    room.getPlayersAsList().some((player: Player) =>
      {
        if(player.socket.id === socket.id){
          playerName = player.name
          return true
        }
      }
    )
  )
  if(roomFound){
    logger.info(`El jugador ${playerName} estaba en la sala ${roomFound.id}. Actualizando lista de salas...`)
    roomFound.removePlayer(playerName)
    io.emit(RoomEvents.LIST, toRoomDTOArray(roomManager.getRooms()))
    logger.info(`Lista actualizada en los clietes`)
  }

  // Me fijo si esta en una partida
  const gameFound = gameManager.getAll().find((game: Game) => 
    game.getPlayersAsList().some((player: Player) => 
      {
        if(player.socket.id === socket.id){
          playerName = player.name
          return true
        }
      }
    )
  )
  if(gameFound){
    logger.info(`Encontramos al jugador ${playerName} en ${gameFound.id}, vamos a ver si sigue la partida y reiniciar la ronda o terminarla.`)
    console.log(gameFound.getPlayersAsList())
    gameManager.handlePlayerDisconnected(playerName, gameFound)
  }
  logger.info("Hasta siempre, soldado")
}

startCleanupJobs()