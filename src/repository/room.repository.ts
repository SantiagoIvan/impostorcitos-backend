import { defaultRooms } from "../db/init";
import { defaultRoom, Room } from "../shared";

export const RoomRepository = {
    getRooms: () : Room[]=> defaultRooms,
    addRoom: (room: Room) : Room=> {
        defaultRooms.push(room)
        return room
    },
    getRoomById: (id: string) => defaultRooms.find((room: Room) => room.id == id) || defaultRoom
}
