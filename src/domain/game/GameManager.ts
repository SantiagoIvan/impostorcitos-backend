import { nextSeqGame } from "../../db";
import { defaultTurn, GamePhase, shuffle, transformSecondsToMS } from "../../lib";
import { RandomGeneratorService } from "../../services";
import { roomManager, Game, Player } from "../";
import { ConsoleLogger, ILogger } from "../../logger";
import { IGameRepository, InMemoryGameRepository } from "../../repository";

class GameManager {

  constructor(
    private readonly gameRepository: IGameRepository,
    private readonly logger: ILogger
  ){}

  createGame(roomId: string): Game {
    const room = roomManager.getRoomById(roomId)
    if(!room) {
      this.logger.error(`Unable to create Game. Room not found`)
      throw new Error("[GAME_MANAGER] Unable to create Game. Room not found")
    } // mejorar y estandarizar los errores
    const playersList = [...room.players.values()]

    const randomTopic = RandomGeneratorService.generateRandomTopic()
    const randomWord = RandomGeneratorService.generateRandomWordFromTopic(randomTopic).toString()
    const impostor = RandomGeneratorService.generateRandomPlayer(playersList)
    const randomOrder = shuffle(playersList.map((player: Player) => player.name))
    
    const game = new Game(
      nextSeqGame(),
      new Date(),
      room,
      randomTopic,
      impostor,
      randomWord,
      randomOrder,
      defaultTurn
    );
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
  startTurn(game: Game){
    game.setTurn = {
        player: game.orderToPlay[game.getNextTurnIndexPlayer],
        duration: 
            game.getCurrentPhase === GamePhase.PLAY? transformSecondsToMS(game.room.moveTime): 
            game.getCurrentPhase === GamePhase.DISCUSSION? 
              transformSecondsToMS(game.room.discussionTime): 
              transformSecondsToMS(game.room.voteTime),
        startedAt: Date.now()
    }
  }
}


export const gameManager = new GameManager(
  new InMemoryGameRepository(),
  new ConsoleLogger(GameManager.name)
)