
import { Game, GameFactory } from "../";
import { ConsoleLogger, ILogger } from "../../logger";
import { IGameRepository, InMemoryGameRepository } from "../../repository";

class GameManager {

  constructor(
    private readonly gameRepository: IGameRepository,
    private readonly logger: ILogger
  ){}

  createGame(roomId: string): Game {
    const game = GameFactory.createGame(roomId)
    this.gameRepository.save(game);
    this.logger.info(`Game has been created successfully: `, game)
    return game;
  }

  getGameById(gameId: string): Game | undefined {
    return this.gameRepository.getById(gameId);
  }

  endGame(gameId: string) {
    const game = this.gameRepository.getById(gameId);
    if (!game) return;

    game.cleanup();
    this.gameRepository.delete(gameId);
  }

  getAll(): Game[] {
    return this.gameRepository.getAll();
  }
}


export const gameManager = new GameManager(
  new InMemoryGameRepository(),
  new ConsoleLogger(GameManager.name)
)