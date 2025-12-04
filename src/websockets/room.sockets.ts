import { Socket } from "socket.io"
import { RoomService } from "../services"
import { RoomEvents, Room, CreateRoomDto } from "../shared"
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
}