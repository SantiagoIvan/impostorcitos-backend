import { RoomService } from "../services"
import { RoomEvents, Room } from "../shared"

export const emitRoomList = (socket: { emit: (arg0: RoomEvents, arg1: Room[]) => void }) => {
    console.log("Emiting: ", RoomService.getRooms())
    socket.emit(RoomEvents.LIST, RoomService.getRooms())
}