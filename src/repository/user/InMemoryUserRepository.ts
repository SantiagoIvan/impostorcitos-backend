import { User } from "../../domain";
import { InMemoryRepository } from "../InMemoryRepository";
import { IUserRepository } from "./IUserRepository";

export class InMemoryUserRepository extends InMemoryRepository<User>
implements IUserRepository{} // En este caso en particular IUSerRepository no agrega metodos adicionales por lo que puedo directamente extender de InMemoryRepository. 
// Lo dejo para repetir el patron en todos los repos