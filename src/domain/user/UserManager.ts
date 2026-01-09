import { Socket } from "socket.io";
import { io } from "../..";
import { nextSeqUser } from "../../db";
import { RoomEvents } from "../../lib";
import { ConsoleLogger, ILogger } from "../../logger";
import { toRoomDTO, toRoomDTOArray } from "../../mappers";
import {  } from "../../repository";
import { InMemoryUserRepository, IUserRepository } from "../../repository";
import { UserNotFoundError } from "../errors";
import { gameManager } from "../game";
import { roomManager } from "../room";
import { User } from "./User";
import { gameService } from "../../services";

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
}

export const userManager = new UserManager(
    new InMemoryUserRepository(),
    new ConsoleLogger(UserManager.name)
)