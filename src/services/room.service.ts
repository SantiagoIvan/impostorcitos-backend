import { nextSeqRoom } from "../db/init"
import { RoomRepository } from "../repository"
import { CreateRoomDto, Room } from "../shared"
import { PlayerService } from "./player.service"

export const RoomService = {
    getRooms: () : Room[]=> RoomRepository.getRooms(),
    addRoom: (roomDto: CreateRoomDto) : Room => {
        const admin = PlayerService.createPlayer(roomDto.admin)
        const newRoom = {
            id: nextSeqRoom(),
            ...roomDto,
            admin,
            createdAt: new Date().toLocaleDateString(),
            players: [admin]
        }
        RoomRepository.addRoom(newRoom)
        return newRoom
    }
}
