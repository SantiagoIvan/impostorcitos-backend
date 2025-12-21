import { Game } from "../../domain";
import { InMemoryRepository } from "../InMemoryRepository";
import { IGameRepository } from "./";

export class InMemoryGameRepository
  extends InMemoryRepository<Game>
  implements IGameRepository {

    // Implementacion concreta de los metodos extra encontrados en IGameRepository para cuando guardo en memoria
}
