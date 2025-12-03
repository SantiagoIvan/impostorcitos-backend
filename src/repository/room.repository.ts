import { defaultRooms } from "../db/init";
import { Room } from "../shared";

export const RoomRepository = {
    getRooms: () => defaultRooms,
    addRoom: (room: Room) => {
        defaultRooms.push(room)
        return room
    }
}
