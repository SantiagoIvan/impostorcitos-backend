import { defaultRooms } from "../db/init";
import { defaultRoom, Room, Player, CreateRoomDto} from "../shared";
import { nextSeqRoom } from "../db/init"


export const RoomRepository = {
    getRooms: () : Room[]=> defaultRooms,
    addRoom: (roomDto: CreateRoomDto) : Room=> {
        const newRoom = {
                    id: nextSeqRoom(),
                    ...roomDto,
                    admin: roomDto.admin,
                    createdAt: new Date().toISOString(),
                    players: []
                }
        defaultRooms.push(newRoom)
        return newRoom
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
