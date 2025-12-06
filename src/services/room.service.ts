import { nextSeqRoom } from "../db/init"
import { RoomRepository } from "../repository"
import { CreateRoomDto, JoinRoomDto, Player, Room } from "../shared"
import { PlayerService } from "./player.service"

export const RoomService = {
    getRooms: () : Room[]=> RoomRepository.getRooms(),
    addRoom: (roomDto: CreateRoomDto) : Room => {
        const admin = PlayerService.createPlayer(roomDto.admin) // aca deberia obtener el player de la BD en realidad
        const newRoom = {
            id: nextSeqRoom(),
            ...roomDto,
            admin,
            createdAt: new Date().toISOString(),
            players: [admin]
        }
        RoomRepository.addRoom(newRoom)
        return newRoom
    },
    isPlayerInRoom: (incomingPlayer: JoinRoomDto) : boolean => {
        const room = RoomRepository.getRoomById(incomingPlayer.roomId)
        
        return room? room.players.some((player:Player) => player.name == incomingPlayer.username) : false
    },
    addPlayerToRoom: (incomingPlayer: JoinRoomDto) => {
        RoomRepository.getRoomById(incomingPlayer.roomId)?.players.push(PlayerService.createPlayer(incomingPlayer.username))
    }
}
