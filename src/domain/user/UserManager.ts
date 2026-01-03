import { ConsoleLogger, ILogger } from "../../logger";
import {  } from "../../repository";
import { InMemoryUserRepository, IUserRepository } from "../../repository";

class UserManager {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly logger: ILogger
      ){}
}

export const userManager = new UserManager(
    new InMemoryUserRepository,
    new ConsoleLogger(UserManager.name)
)