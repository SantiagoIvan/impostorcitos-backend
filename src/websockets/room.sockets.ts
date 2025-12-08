import { Socket } from "socket.io"
import { RoomService } from "../services"
import { RoomEvents, Room, CreateRoomDto, JoinRoomDto, Player } from "../shared"
import { Server } from "socket.io";
import { GENERAL_CHAT_CHANNEL } from "../shared/constants";

export const emitRoomList = (socket: { emit: (arg0: RoomEvents, arg1: Room[]) => void }) => {
  socket.emit(RoomEvents.LIST, RoomService.getRooms())
}

export const registerAllRoomEvents = (socket: Socket, io: Server) => {
    
  socket.on(RoomEvents.CREATE, (roomDto : CreateRoomDto) => {
    const newRoom = RoomService.addRoom(roomDto)
    console.log("Room creado: ", roomDto)
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

}