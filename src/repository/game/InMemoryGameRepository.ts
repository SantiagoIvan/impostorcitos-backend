import { Game } from "../../domain";
import { InMemoryMapRepository } from "../InMemoryRepository";
import { IGameRepository } from "./";

export class InMemoryGameRepository
  extends InMemoryMapRepository<Game>
  implements IGameRepository {

    // Implementacion concreta de los metodos extra encontrados en IGameRepository para cuando guardo en memoria
}
