import { nextSeqRoom } from "../db/init"
import { RoomRepository } from "../repository"
import { CreateRoomDto } from "../shared"

export const RoomService = {
    getRooms: () => RoomRepository.getRooms(),
    addRoom: (roomDto: CreateRoomDto) => {
        const newRoom = {
            id: nextSeqRoom(),
            ...roomDto,
            createdAt: new Date().toLocaleDateString(),
            players: []
        }
        RoomRepository.addRoom(newRoom)
        return newRoom
    }
}
