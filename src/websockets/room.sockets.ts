import { Socket } from "socket.io"
import { RoomService } from "../services"
import { RoomEvents, Room, CreateRoomDto, JoinRoomDto, Player } from "../shared"
import { Server } from "socket.io";

export const emitRoomList = (socket: { emit: (arg0: RoomEvents, arg1: Room[]) => void }) => {
  socket.emit(RoomEvents.LIST, RoomService.getRooms())
}

export const registerAllRoomEvents = (socket: Socket, io: Server) => {
    
  socket.on(RoomEvents.CREATE, (roomDto : CreateRoomDto) => {
    console.log("Room creado: ", roomDto)
    const newRoom = RoomService.addRoom(roomDto)
    io.emit(RoomEvents.CREATED, newRoom)
  })
  
  socket.on(RoomEvents.JOIN, (incomingPlayer : JoinRoomDto) => {
    // Cuando un jugador se une a un Room, se une a determinado canal, 
    // donde se emitiran los eventos de mensajes del canal (nuevos ingresos/egresos, mensajes y relacionados al juego)
    console.log(`New player ${incomingPlayer.username} trying to join ${incomingPlayer.roomId}`)
    // Si el usuario ya estaba en la sala, lo ignoro
    if(RoomService.isPlayerInRoom(incomingPlayer)) return
    
    console.log(`New player ${incomingPlayer.username} successfully added to ${incomingPlayer.roomId}`)
    RoomService.addPlayerToRoom(incomingPlayer)
    socket.join(incomingPlayer.roomId)
    io.emit(RoomEvents.JOINED, RoomService.getRooms()) 
    
  })

}