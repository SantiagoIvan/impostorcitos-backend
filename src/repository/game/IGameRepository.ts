import { Game } from "../../domain";
import { IRepository } from "../IRepository";

export interface IGameRepository extends IRepository<Game> {
    // Agregar aca si necesito metodos concretos de esta clase
}