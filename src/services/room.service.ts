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
    isPlayerInRoom: (playerDto: JoinRoomDto) : boolean => {
        const room = RoomRepository.getRoomById(playerDto.roomId)
        
        return room.players.some((player:Player) => player.name == playerDto.username)
    },
    addPlayerToRoom: (incomingPlayer: JoinRoomDto): Room => {
        RoomRepository.getRoomById(incomingPlayer.roomId)?.players.push(PlayerService.createPlayer(incomingPlayer.username))
        return RoomRepository.getRoomById(incomingPlayer.roomId)
    },
    removePlayerfromRoom: (outcomingPlayer: JoinRoomDto): Room => {
        const targetRoom = RoomRepository.getRoomById(outcomingPlayer.roomId)
        targetRoom.players = targetRoom.players.filter((player: Player) => player.name !== outcomingPlayer.username)
        return RoomRepository.getRoomById(outcomingPlayer.roomId)
    }
}
