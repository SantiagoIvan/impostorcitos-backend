import { CreateRoomDto, JoinRoomDto, RoomEvents } from "../../lib"
import { ConsoleLogger } from "../../logger"
import { toRoomDTO } from "../../mappers"
import { roomService } from "../../services"
import { io } from "../.."
import { Player, roomManager } from "../../domain"

const logger = new ConsoleLogger("ROOM_LISTENERS")

export function onRoomCreate(roomDto : CreateRoomDto){
    try{
        const newRoom = roomService.createRoom(roomDto)
        io.emit(RoomEvents.CREATED, toRoomDTO(newRoom))
    }catch(error: any){
        logger.error(error.message)
    }
}