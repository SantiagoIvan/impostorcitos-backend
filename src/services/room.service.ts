import { randomInt } from "crypto"
import { words } from "../db"
import { topics } from "../db"
import { parseTopic, RoomDto, CreateRoomDto } from "../lib"
import { Player, PlayerNotFoundError, Room, roomManager } from "../domain"
import { ConsoleLogger, ILogger } from "../logger"

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
}

export const roomService = new RoomService(
    new ConsoleLogger(RoomService.name)
)
