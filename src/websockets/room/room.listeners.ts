import { CreateRoomDto, GameEvents, JoinRoomDto, RoomEvents, UpdateTopicDto } from "../../lib"
import { ConsoleLogger } from "../../logger"
import { toRoomDTO, toRoomDTOArray } from "../../mappers"
import { gameService, roomService } from "../../services"
import { io } from "../.."
import { gameManager, Player, roomManager, RoomNotFoundError, UserNotFoundError } from "../../domain"
import { registerGameEvents } from "../game"
import { userManager } from "../../domain/user/UserManager"

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
        updatedRoom.getPlayersAsList().forEach((player: Player) => {
            if(player.socket !== undefined){
                console.warn("socket no seteado", player.socket !== undefined)
                console.warn(player.name)
            }
            player.socket?.emit(RoomEvents.USER_LEFT, toRoomDTO(updatedRoom))
        })
    }catch(error: any){
        logger.error(error.message)
    }
}

export function onStartGame(roomId : string) {
    try{
        const newGame = gameManager.createGame(roomId)
        newGame.resetPlayersState()
        roomManager.removeRoom(roomId)
       
        newGame.getPlayersAsList().forEach((player: Player) => {
            const user = userManager.getUserByUsername(player.name)
            if(!user) {
                throw new UserNotFoundError(player.name)
            }
            user.setRoomId = ""
            user.setGameId = newGame.id
        })

        const rooms = toRoomDTOArray(roomManager.getRooms())
        io.emit(RoomEvents.LIST, rooms)
        gameService.updateGameStateToClient(newGame, RoomEvents.REDIRECT_TO_GAME)
    }catch(error: any){
        logger.error(error.message)
    }
}


// Esto es para sincronizar a los clietes cuando empieza la partida que aparece el modal con la palabra secreta o el msg SOS EL IMPOSTOR
export function onPlayerReady({username, gameId}:{username: string, gameId: string}){
    try{
        const game = gameManager.getGameById(gameId)
        if(!game) return
    
        const found = game.room.players.get(username)
        if(!found || found.ready) return
    
    
        found.setIsReady(true)
        if(game.allReady()) {
          game.resetPlayersState() // Les ponemos el flag de ready en false y skipPhase a todos.
          game.startTurn() // configuro el currentTurn y el timer
          game.getPlayersAsList().forEach((p: Player) => {
            p.socket?.join(game.id)
            registerGameEvents(p.socket)
          })
          gameService.updateGameStateToClient(game, GameEvents.START_ROUND)
        }
    }catch(error: any){
        logger.error(error.message)
    }
  }

  export function onUpdateTopic({roomId, newTopic, randomFlag} : UpdateTopicDto){
    try{
        logger.info(`Sala ${roomId} - Actualizando topico a ${newTopic} con random flag ${randomFlag}`)
        const room = roomManager.getRoomById(roomId)
        if(!room) throw new RoomNotFoundError(roomId)

        room.setRandomTopic(randomFlag)
        if(!randomFlag && newTopic) {
            room.setTopic(newTopic)
        }
        
        console.log("updated room: ", room)
        io.to(roomId).emit(RoomEvents.UPDATED_TOPIC, toRoomDTO(room))
    }catch(e){
        logger.error("Error actualizando topico")
    }
  }