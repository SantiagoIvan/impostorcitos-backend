import { Socket } from "socket.io"
import { RoomService } from "../services"
import { RoomEvents, Room, CreateRoomDto, JoinRoomDto } from "../shared"
import { Server } from "socket.io";

export const emitRoomList = (socket: { emit: (arg0: RoomEvents, arg1: Room[]) => void }) => {
  console.log("Emiting: ", RoomService.getRooms())
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
    console.log(`${incomingPlayer.username} entro al canal ${incomingPlayer.roomId}`)
    socket.join(incomingPlayer.roomId)
    io.to(incomingPlayer.roomId).emit(RoomEvents.JOINED, incomingPlayer)
  })

}