import { CreateRoomDto, GameEvents, JoinRoomDto, RoomEvents } from "../../lib"
import { ConsoleLogger } from "../../logger"
import { toRoomDTO, toRoomDTOArray } from "../../mappers"
import { gameService, roomService } from "../../services"
import { io } from "../.."
import { gameManager, Player, roomManager } from "../../domain"
import { registerGameEvents } from "../game"

const logger = new ConsoleLogger("ROOM_LISTENERS")

export function onRoomCreate(roomDto : CreateRoomDto){
    try{
        const newRoom = roomService.createRoom(roomDto)
        io.emit(RoomEvents.CREATED, toRoomDTO(newRoom))
    }catch(error: any){
        logger.error(error.message)
    }
}

export function onRoomReady(userReady: JoinRoomDto){
    try{
        const updatedRoom = roomService.playerReady(userReady.username, userReady.roomId)
        io.to(userReady.roomId).emit(RoomEvents.USER_READY, toRoomDTO(updatedRoom))
    }catch(error: any){
        logger.error(error.message)
    }
}

export function onStartGame(roomId : string) {
    try{
        const newGame = gameManager.createGame(roomId)
        newGame.resetRoundTurnState()
        roomManager.removeRoom(roomId)
       
        const rooms = toRoomDTOArray(roomManager.getRooms())
        io.emit(RoomEvents.LIST, rooms)
        gameService.updateGameStateToClient(newGame, RoomEvents.REDIRECT_TO_GAME)
    }catch(error: any){
        logger.error(error.message)
    }
}

export function onPlayerReady({username, gameId}:{username: string, gameId: string}){
    try{
        const game = gameManager.getGameById(gameId)
        if(!game) return
    
        const found = game.room.players.get(username)
        if(!found || found.ready) return
    
    
        found.setIsReady(true)
        if(game.allReady()) {
          game.resetRoundTurnState()
          game.startTurn()
          game.getPlayersAsList().forEach((p: Player) => {
            registerGameEvents(p.socket, io)
          })
          gameService.updateGameStateToClient(game, GameEvents.START_ROUND)
        }
    }catch(error: any){
        logger.error(error.message)
    }
  }