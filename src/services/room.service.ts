import { nextSeqRoom } from "../db/init"
import { RoomRepository } from "../repository"
import { CreateRoomDto, JoinRoomDto, Player, Room } from "../shared"
import { PlayerService } from "./player.service"

export const RoomService = {
    getRooms: () : Room[]=> RoomRepository.getRooms(),
    addRoom: (roomDto: CreateRoomDto) : Room => { // aca deberia obtener el player de la BD en realidad
        const newRoom = {
            id: nextSeqRoom(),
            ...roomDto,
            admin: roomDto.admin,
            createdAt: new Date().toISOString(),
            players: []
        }
        RoomRepository.addRoom(newRoom)
        return newRoom
    },
    isPlayerInRoom: (playerDto: JoinRoomDto) : boolean => {
        const room = RoomRepository.getRoomById(playerDto.roomId)
        
        return room.players.some((player:Player) => player.name == playerDto.username)
    },
    addPlayerToRoom: (incomingPlayer: JoinRoomDto): Room => {
        const player = PlayerService.createPlayer(incomingPlayer.username)
        return RoomRepository.addPlayerToRoom(player, incomingPlayer.roomId)
    },
    removePlayerfromRoom: (outcomingPlayer: JoinRoomDto): Room => {
        const targetRoom = RoomRepository.getRoomById(outcomingPlayer.roomId)
        targetRoom.players = targetRoom.players.filter((player: Player) => player.name !== outcomingPlayer.username)
        return targetRoom
    },
    togglePlayerReadyInRoom: (userReady : JoinRoomDto): Room => {
        const targetRoom = RoomRepository
                                .getRoomById(userReady.roomId)           
        const targetPlayer = targetRoom.players.find((player: Player) => player.name === userReady.username)
        if(targetPlayer) {
            targetPlayer.isReady = !targetPlayer.isReady
        }
        return targetRoom
    },
    removeRoom: (targetRoomId: string): Room[] => {
        return RoomRepository.removeRoom(targetRoomId)
    }
}
