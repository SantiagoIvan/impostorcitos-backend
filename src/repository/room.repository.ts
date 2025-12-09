import { defaultRooms } from "../db/init";
import { defaultRoom, JoinRoomDto, Room } from "../shared";
import { PlayerService } from "../services";

export const RoomRepository = {
    getRooms: () : Room[]=> defaultRooms,
    addRoom: (room: Room) : Room=> {
        defaultRooms.push(room)
        return room
    },
    getRoomById: (id: string) => defaultRooms.find((room: Room) => room.id == id) || defaultRoom,
    addPlayerToRoom: (incomingPlayer : JoinRoomDto) => {
        const room = (defaultRooms.find((room: Room) => room.id == incomingPlayer.roomId) || defaultRoom)
        room.players.push(PlayerService.createPlayer(incomingPlayer.username))
        return room
    }
}
