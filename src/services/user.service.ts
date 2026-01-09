import { CreateRoomDto, RoomEvents } from "../lib"
import { gameManager, Player, PlayerNotFoundError, Room, roomManager, User } from "../domain"
import { ConsoleLogger, ILogger } from "../logger"
import { toRoomDTO, toRoomDTOArray } from "../mappers"
import { io } from ".."
import { userManager } from "../domain/user/UserManager"
import { gameService } from "./game.service"

class UserService {
    constructor(
        private readonly logger: ILogger
    ){}
    handleDisconnect = (user: User) => {
        const socket = user.getSocket()

        if(!socket) {
            this.logger.warn("No socket found when removing ", user.username)
        }

        this.logger.info("A player has left the game")
        socket?.removeAllListeners()

        // Obtengo al jugador del UserManager
        if(!user){
            this.logger.error(`User Not Found`)
            return
        }

        this.logger.warn(`User ${user.username} has left the game`)
        // Me fijo si esta en una sala, para eliminarlo de ahi y volver a emitir el evento de lista a todos los clientes
        const roomId = user.getRoomId()

        if(roomId){
            const roomFound = roomManager.getRoomById(roomId)
            if(!roomFound) {
                this.logger.warn(`El jugador ${user.username} no estaba en ninguna sala`)
                return
            }
            
            this.logger.info(`El jugador ${user.username} estaba en la sala ${roomId}. Actualizando lista de salas a los clientes...`)
            roomFound.removePlayer(user.username)
            console.log(roomFound)
            io.emit(RoomEvents.USER_LEFT, toRoomDTO(roomFound))
            this.logger.info(`Lista actualizada en los clietes`)
        }

        // Me fijo si esta en una partida
        const gameId = user.getGameId()
        if(gameId){
            const gameFound = gameManager.getGameById(gameId)
            if(!gameFound) {
                this.logger.error(`El jugador ${user.username} no estaba en ninguna partida`)
                return
            }

            this.logger.info(`Encontramos al jugador ${user.username} en ${gameId}, vamos a ver si sigue la partida y reiniciar la ronda o terminarla.`)
            gameService.handlePlayerDisconnected(user.username, gameFound.id)
        }
        userManager.removeUser(user.id)
        this.logger.info("Hasta siempre, soldado")
    }
}

export const userService = new UserService(
    new ConsoleLogger(UserService.name)
)
