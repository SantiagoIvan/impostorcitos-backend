import { RoomEvents, Room } from "../shared"
import { rooms } from ".."

export const emitRoomList = (socket: { emit: (arg0: RoomEvents, arg1: Room[]) => void }) => {
    socket.emit(RoomEvents.LIST, rooms)
}