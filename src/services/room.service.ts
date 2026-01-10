import { CreateRoomDto, JoinRoomDto, RoomEvents } from "../lib"
import { IncorrectPassword, Player, PlayerNotFoundError, Room, roomManager, RoomNotFoundError, RoomType, UserNotFoundError } from "../domain"
import { ConsoleLogger, ILogger } from "../logger"
import { toRoomDTO, toRoomDTOArray } from "../mappers"
import { GENERAL_CHAT_CHANNEL, io } from ".."
import { userManager } from "../domain/user/UserManager"

class RoomService {
    constructor(
        private readonly logger: ILogger
    ){}
    createRoom(roomDto: CreateRoomDto): Room{
        this.logger.info(`Creating room...`)
        const newRoom = roomManager.createRoom(roomDto)
        this.logger.info(`New room created! ID: `, newRoom.id)
        return newRoom
    }
    playerReady(username: string, roomId: string): Room{
        if(!roomManager.isPlayerInRoom(username, roomId)) throw new PlayerNotFoundError(username, roomId)
        this.logger.info(`Player ${username} has toggled Ready`)
        return roomManager.togglePlayerReadyInRoom(username, roomId)
    }
    notifyAbortRoomToPlayer(player: Player) {
        this.logger.warn("Room aborted. Notifying to players...")
        player.socket?.emit(RoomEvents.ABORT_ROOM)
        io.emit(RoomEvents.LIST, toRoomDTOArray(roomManager.getRooms()))
    }
    joinRoom(incomingPlayer: JoinRoomDto): Room{
        
        if(roomManager.isPlayerInRoom(incomingPlayer.username, incomingPlayer.roomId)) throw Error("Player already was in that room")
        const user = userManager.getUserByUsername(incomingPlayer.username)
        if(!user) throw new UserNotFoundError(incomingPlayer.username)
        
        const room = roomManager.getRoomById(incomingPlayer.roomId)
        if(!room) throw new RoomNotFoundError(incomingPlayer.roomId)
        
        if(room.privacy === RoomType.PRIVATE ){
            if(incomingPlayer.password !== room.getPassword()) {
                throw new IncorrectPassword()
            }
        }

        const player = new Player(incomingPlayer.username, user)
        const updatedRoom = roomManager.addPlayerToRoom(player, incomingPlayer.roomId)
        
        // Buscar al user por name y agregarle el roomId, sacarselo en el Leave.
        user.setRoomId = incomingPlayer.roomId
    
        user.getSocket()?.leave(GENERAL_CHAT_CHANNEL)
        user.getSocket()?.join(incomingPlayer.roomId)
    
        return updatedRoom
    }
}

export const roomService = new RoomService(
    new ConsoleLogger(RoomService.name)
)
