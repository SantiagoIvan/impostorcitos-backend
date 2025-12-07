import { Socket } from "socket.io"
import { RoomService } from "../services"
import { RoomEvents, Room, CreateRoomDto, JoinRoomDto, Player } from "../shared"
import { Server } from "socket.io";

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
    
    console.log(`New player ${incomingPlayer.username} trying to join ${incomingPlayer.roomId}`)
    const updatedRoom = RoomService.addPlayerToRoom(incomingPlayer)
    socket.join(incomingPlayer.roomId)
    io.emit(RoomEvents.JOINED, updatedRoom) 
    
  })

  socket.on(RoomEvents.LEAVE, (outcomingPlayer: JoinRoomDto) => {
    if(!RoomService.isPlayerInRoom(outcomingPlayer)) return
    
    console.log(`New player ${outcomingPlayer.username} is trying to LEAVE from ${outcomingPlayer.roomId}`)
    const updatedRoom = RoomService.removePlayerfromRoom(outcomingPlayer)
    socket.leave(outcomingPlayer.roomId)
    io.emit(RoomEvents.USER_LEFT, updatedRoom)
  })

}