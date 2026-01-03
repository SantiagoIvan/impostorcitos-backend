import { User } from "../../domain";
import { InMemoryRepository } from "../InMemoryRepository";
import { IUserRepository } from "./IUserRepository";

export class InMemoryUserRepository extends InMemoryRepository<User>
implements IUserRepository{
    userExists(username: string): boolean {
        for(let user of this.items.values()){
            if(user.username === username) return true
        }
        return false
    }
} 