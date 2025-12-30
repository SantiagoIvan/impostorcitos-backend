import { CreateRoomDto, RoomEvents } from "../lib"
import { Player, PlayerNotFoundError, Room, roomManager } from "../domain"
import { ConsoleLogger, ILogger } from "../logger"
import { toRoomDTOArray } from "../mappers"
import { emitRoomList } from "../websockets"
import { io } from ".."

class RoomService {
    constructor(
        private readonly logger: ILogger
    ){}
    createRoom(roomDto: CreateRoomDto): Room{
        return roomManager.createRoom(roomDto)
    }
    playerReady(username: string, roomId: string): Room{
        if(!roomManager.isPlayerInRoom(username, roomId)) throw new PlayerNotFoundError(username, roomId)
        return roomManager.togglePlayerReadyInRoom(username, roomId)
    }
    notifyAbortRoomToPlayer(player: Player) {
        player.socket.emit(RoomEvents.ABORT_ROOM)
        io.emit(RoomEvents.LIST, toRoomDTOArray(roomManager.getRooms()))
    }
}

export const roomService = new RoomService(
    new ConsoleLogger(RoomService.name)
)
