import { ConsoleLogger, ILogger } from "../../logger";
import {  } from "../../repository";
import { InMemoryUserRepository, IUserRepository } from "../../repository";
import { UserNotFoundError } from "../errors";
import { User } from "./User";

class UserManager {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly logger: ILogger
      ){}

    addUser(user: User): User{
        this.userRepository.save(user)
        return user
    }
    removeUser(userId: string){
        try{
            const user = this.userRepository.getById(userId)
            if(!user) throw new UserNotFoundError(userId)

            this.logger.warn(`Removing user ${userId}...`)
            user.getSocket().removeAllListeners()
            this.userRepository.delete(userId)
        }catch(error: any){
            this.logger.error(error.message)
        }
    }
    userExists(username: string): boolean{
        return this.userRepository.userExists(username)
    }
}

export const userManager = new UserManager(
    new InMemoryUserRepository,
    new ConsoleLogger(UserManager.name)
)