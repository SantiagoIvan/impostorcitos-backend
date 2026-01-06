
import { Game, GameFactory, GamePhase, Player, RoundResultFactory } from "../";
import { ConsoleLogger, ILogger } from "../../logger";
import { IGameRepository, InMemoryGameRepository } from "../../repository";
import { GENERAL_CHAT_CHANNEL, io } from "../..";
import { GameEvents } from "../../lib";
import { toGameDTO } from "../../mappers";

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

      // Desconectamos al jugador
      game.disconnectPlayer(playerName)

      // Emitir que se desconecto uno
      io.to(game.id).emit(GameEvents.PLAYER_LEFT_GAME, {playerName, game: toGameDTO(game)})
      
      if(game.validStateToPlay()){
        // Emitir evento START_ROUD y reconfigurar el game
        this.logger.info(`Valido para seguir jugando, vamos a ver si salteo el turno`)
        const gameWithRoundResult = playerLeftRoundResult(playerName, game)
        gameWithRoundResult.resetRoundTurnState()
        gameWithRoundResult.getPlayersAsList().forEach((player: Player) => {
            player.socket?.emit(GameEvents.ROUND_RESULT, {game: toGameDTO(gameWithRoundResult, player.name), roundResult: gameWithRoundResult.getLastRoundResult()})
        })
        
      }else{
        // Emitir END Game.
        this.logger.info(`Abortando partida...`)
        game.cleanup()
        game.abort()
        game.getPlayersAsList().forEach((player: Player) => {
            player.socket?.emit(GameEvents.END_GAME, {game: toGameDTO(game, player.name), roundResult: game.getLastRoundResult()})
            player.socket?.leave(game.id)
            player.socket?.join(GENERAL_CHAT_CHANNEL)
        })
      }
    }catch(error: any){
      this.logger.error(error.message)
    }

  }
}

function playerLeftRoundResult(playerName: string, game: Game): Game {
  game.setCurrentPhase = GamePhase.ROUND_RESULT
  const roundResult = RoundResultFactory.createRoundResultDto(game, [playerName])
  game.addRoundResult(roundResult)
  return game
}


export const gameManager = new GameManager(
  new InMemoryGameRepository(),
  new ConsoleLogger(GameManager.name)
)