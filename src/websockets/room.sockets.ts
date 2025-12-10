import { Socket } from "socket.io"
import { GameService, RoomService } from "../services"
import { RoomEvents, Room, CreateRoomDto, JoinRoomDto, Player, GameEvents } from "../shared"
import { Server } from "socket.io";
import { GENERAL_CHAT_CHANNEL } from "../shared/constants";
import { registerGameEvents } from "./game.sockets";

let counter = 0
export const emitRoomList = (socket: { emit: (arg0: RoomEvents, arg1: Room[]) => void }) => {
  socket.emit(RoomEvents.LIST, RoomService.getRooms())
}

export const registerAllRoomEvents = (socket: Socket, io: Server) => {
    
  socket.on(RoomEvents.CREATE, (roomDto : CreateRoomDto) => {
    const newRoom = RoomService.addRoom(roomDto)
    io.emit(RoomEvents.CREATED, newRoom)
  })
  
  socket.on(RoomEvents.JOIN, (incomingPlayer : JoinRoomDto) => {
    // Cuando un jugador se une a un Room, se une a determinado canal, 
    // donde se emitiran los eventos de mensajes del canal (nuevos ingresos/egresos, mensajes y relacionados al juego)
    // Si el usuario ya estaba en la sala, lo ignoro
    if(RoomService.isPlayerInRoom(incomingPlayer)) return
    
    // Cuando un jugador se une a un room, se une al canal especifico y se va del general
    socket.leave(GENERAL_CHAT_CHANNEL)
    console.log(`New player ${incomingPlayer.username} trying to join ${incomingPlayer.roomId}`)
    const updatedRoom = RoomService.addPlayerToRoom(incomingPlayer)
    socket.join(incomingPlayer.roomId)
    io.emit(RoomEvents.JOINED, updatedRoom) 
    
  })

  socket.on(RoomEvents.LEAVE, (outcomingPlayer: JoinRoomDto) => {
    if(!RoomService.isPlayerInRoom(outcomingPlayer)) return
    
    // Cuando un jugador se va de un room, se sale del canal del room y entra al chat general
    console.log(`New player ${outcomingPlayer.username} is trying to LEAVE from ${outcomingPlayer.roomId}`)
    socket.join(GENERAL_CHAT_CHANNEL)
    const updatedRoom = RoomService.removePlayerfromRoom(outcomingPlayer)
    socket.leave(outcomingPlayer.roomId)
    io.emit(RoomEvents.USER_LEFT, updatedRoom)
  })

  socket.on(RoomEvents.READY, (userReady: JoinRoomDto) => {
    if(!RoomService.isPlayerInRoom(userReady)) return
    
    // Jugador activa el boton Ready y le avisa al resto de los jugadores
    console.log(`Player ${userReady.username} is ready for room ${userReady.roomId}`)
    const updatedRoom = RoomService.togglePlayerReadyInRoom(userReady)
    io.to(userReady.roomId).emit(RoomEvents.USER_READY, updatedRoom)
  })

  socket.on(RoomEvents.START_GAME, (roomId : string) => {
    // Crear nuevo Game object y eliminar room de la lista
    const newGame = GameService.createGame(roomId)
    console.log("New game created ", newGame)
    const rooms = RoomService.removeRoom(roomId)
    io.emit(RoomEvents.LIST, rooms)
    io.to(roomId).emit(RoomEvents.REDIRECT_TO_GAME, newGame)
  })

  socket.on(GameEvents.PLAYER_READY, ({username, gameId}) => {
    // contar players.isReady del room
    const game = GameService.getGameById(gameId)
    const found = game.activePlayers.find((player: Player) => player.name === username)
    if(found){
      found.isReady = true
    }
    if(game.activePlayers.every((player: Player) => player.isReady)){
      io.to(game.room.id).emit(GameEvents.ALL_READY)
    }
  })
}