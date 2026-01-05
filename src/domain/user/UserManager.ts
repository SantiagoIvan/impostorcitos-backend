import { Socket } from "socket.io";
import { io } from "../..";
import { nextSeqUser } from "../../db";
import { RoomEvents } from "../../lib";
import { ConsoleLogger, ILogger } from "../../logger";
import { toRoomDTOArray } from "../../mappers";
import {  } from "../../repository";
import { InMemoryUserRepository, IUserRepository } from "../../repository";
import { UserNotFoundError } from "../errors";
import { gameManager } from "../game";
import { roomManager } from "../room";
import { User } from "./User";

class UserManager {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly logger: ILogger
      ){}

    addUser(username: string): User{
        const userId = nextSeqUser() // Volar esta negrada cuando me integre con Redis
        const user = new User(userId, username) // Cuando se conecta por WS ahi le agrego el sk al objeto
        this.userRepository.save(user)
        this.logger.info(`User ${username} has entered the game`)
        return user
    }
    removeUser(userId: string){
        try{
            const user = this.userRepository.getById(userId)
            if(!user) throw new UserNotFoundError(userId)

            this.logger.warn(`Removing user ${userId}...`)
            user.getSocket()?.removeAllListeners()
            this.userRepository.delete(userId)
        }catch(error: any){
            this.logger.error(error.message)
        }
    }
    userExists(username: string): boolean{
        return this.userRepository.userExists(username)
    }
    getUserByUsername(username: string): User | undefined {
        return this.userRepository.getUserByUsername(username)
    }
    getUserBySocketId(skId: string): User | undefined {
        return this.userRepository.getUserBySocketId(skId)
    }
    getUsers(): User[]{
        return this.userRepository.getAll()
    }
    handleDisconnect = (user: User) => {
        const socket = user.getSocket()

        if(!socket) {
            this.logger.warn("No socket found when removing ", user.username)
        }

        this.logger.info("A player has left the game")
        socket?.removeAllListeners()

        let playerName = ""
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
            this.logger.error("Sala no encontrada")
            return
            }
            
            this.logger.info(`El jugador ${playerName} estaba en la sala ${roomId}. Actualizando lista de salas a los clientes...`)
            roomFound.removePlayer(playerName)
            io.emit(RoomEvents.LIST, toRoomDTOArray(roomManager.getRooms()))
            this.logger.info(`Lista actualizada en los clietes`)
        }

        // Me fijo si esta en una partida
        const gameId = user.getGameId()
        if(gameId){
            const gameFound = gameManager.getGameById(gameId)
            if(!gameFound) {
            this.logger.error("Game no encontrada")
            return
            }

            this.logger.info(`Encontramos al jugador ${playerName} en ${gameId}, vamos a ver si sigue la partida y reiniciar la ronda o terminarla.`)
            gameManager.handlePlayerDisconnected(playerName, gameFound)
        }
        userManager.removeUser(user.id)
        this.logger.info("Hasta siempre, soldado")
    }
}

export const userManager = new UserManager(
    new InMemoryUserRepository(),
    new ConsoleLogger(UserManager.name)
)