import { CreateRoomDto, RoomEvents } from "../lib"
import { Player, PlayerNotFoundError, Room, roomManager } from "../domain"
import { ConsoleLogger, ILogger } from "../logger"
import { toRoomDTO, toRoomDTOArray } from "../mappers"
import { io } from ".."

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
}

export const roomService = new RoomService(
    new ConsoleLogger(RoomService.name)
)
