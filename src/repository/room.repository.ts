import { defaultRooms } from "../db/init";
import { Room } from "../shared";

export const RoomRepository = {
    getRooms: () : Room[]=> defaultRooms,
    addRoom: (room: Room) : Room=> {
        defaultRooms.push(room)
        return room
    }
}
