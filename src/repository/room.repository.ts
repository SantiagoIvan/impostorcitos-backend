import { defaultRooms } from "../db/init";
import { defaultRoom, Room, Player} from "../shared";

export const RoomRepository = {
    getRooms: () : Room[]=> defaultRooms,
    addRoom: (room: Room) : Room=> {
        defaultRooms.push(room)
        return room
    },
    getRoomById: (id: string) => defaultRooms.find((room: Room) => room.id == id) || defaultRoom,
    addPlayerToRoom: (player : Player, roomId: string) => {
        const room = (defaultRooms.find((room: Room) => room.id == roomId) || defaultRoom)
        room.players.push(player)
        return room
    },
    removeRoom: (targetRoomId: string): Room[] => {
        let indexOfTarget = 0
        for (let index = 0; index < defaultRooms.length; index++) {
            if(defaultRooms[index].id === targetRoomId){
                indexOfTarget = index
                break
            }
        }
        defaultRooms.splice(indexOfTarget, 1)
        return defaultRooms
    }
}
