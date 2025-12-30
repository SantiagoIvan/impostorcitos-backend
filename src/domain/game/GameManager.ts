
import { Game, GameFactory } from "../";
import { ConsoleLogger, ILogger } from "../../logger";
import { IGameRepository, InMemoryGameRepository } from "../../repository";
import { io } from "../..";
import { GameEvents } from "../../lib";
import { toGameDTO } from "../../mappers";
import { gameService } from "../../services";

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

  handlePlayerDisconnected(playerName: string, game: Game) {
    try{
      this.logger.info(`Se desconecto un jugador: ${playerName} del game: ${game.id}. vamos a ver si la partida sigue o que onda`)
      // Si esta muerto, me chupa un huevo y tiro return
      const playerFound = game.getPlayerByName(playerName)
      if(!playerFound || !playerFound.alive) {
        this.logger.info(`Se desconecto un jugador: ${playerName} del game: ${game.id}. Estaba muerto asi que me chupa un huevo`)
        return
      }

      // Lo seteo como desconectado
      game.disconnectPlayer(playerName)

      // Emitir que se desconecto uno
      io.to(game.id).emit(GameEvents.PLAYER_LEFT_GAME, {playerName, game: toGameDTO(game)})
      
      if(game.validStateToPlay()){
        // Emitir evento START_ROUD y reconfigurar el game
        this.logger.info(`Valido para seguir jugando, vamos a resetear la ronda`)
        game.resetRoundTurnState()
        game.computeFirstAvailableTurn()
        this.logger.info(`El siguiente turno es de ${game.getCurrentTurn.player}. Ronda ${game.getCurrentRound}`)
        
        gameService.updateGameStateToClient(game, GameEvents.START_ROUND)
        
      }else{
        // Emitir END Game.
        this.logger.info(`Abortando partida...`)
        game.cleanup()
        gameService.updateGameStateToClient(game, GameEvents.END_GAME)
      }
    }catch(error: any){
      this.logger.error(error.message)
    }

  }
}


export const gameManager = new GameManager(
  new InMemoryGameRepository(),
  new ConsoleLogger(GameManager.name)
)