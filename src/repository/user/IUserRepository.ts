import { User } from "../../domain";
import { IRepository } from "../IRepository";

export interface IUserRepository extends IRepository<User>{
    userExists(username: string): boolean
}