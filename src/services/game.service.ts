import { RoomEvents, GameEvents, SubmitWordDto, PlayerReadyDto, SubmitVoteDto } from "../lib";
import { toGameDTO } from "../mappers";
import { Game, gameManager, GameNotFoundError, Player, PlayerNotFoundError, GamePhase, PlayerCantPlay, MoveFactory, VoteFactory, RoundResultFactory } from "../domain";
import { ConsoleLogger, ILogger } from "../logger";


class GameService {
    constructor(
        private readonly logger: ILogger
      ){}
    validateGameExists(gameId: string): Game{
        const game = gameManager.getGameById(gameId)
        if(!game) throw new GameNotFoundError(gameId)
        return game
    }
    
    validatePlayerExistsIngame(game: Game, name: string): Player{
        const player = game.getPlayerByName(name)
        if(!player) throw new PlayerNotFoundError(name, game.id)
        return player
    }
    
    validatePlayerCanPlayInPhase(game: Game, targetPhase: GamePhase, player: Player){
        if(
            (game.getCurrentPhase !== targetPhase) || 
            !player.canPlay()
        ) throw new PlayerCantPlay(player.name, game.id)
    }
    updateGameStateToClient(game: Game, event: RoomEvents | GameEvents) {
        game.getPlayersAsList().forEach((player: Player) => {
            const gameDto = toGameDTO(game, player.name)
            player.socket.emit(event, gameDto)
        })
    }

    play(submitWordDto: SubmitWordDto): Game{
        // Validaciones para ver si lanzo excepcion
        this.logger.info(`${submitWordDto.username} played ${submitWordDto.word}`)
        const game = this.validateGameExists(submitWordDto.gameId)
        const player = this.validatePlayerExistsIngame(game, submitWordDto.username)
        this.validatePlayerCanPlayInPhase(game, GamePhase.PLAY, player)

        // Creacio de la Jugada
        const move = MoveFactory.createMove(submitWordDto, game.getCurrentRound)
        game.addMove(move)
        player.markHasPlayed()
        this.logger.info(`${player.name} has successfully played `, move.word)

        // Verifico si todos jugaron para saber si activo la siguiente fase
        if(game.allPlayed()){
            this.logger.warn("Starting discussion phase")
            // Actualizo la fase del juego y les seteo a todos de vuelta el flag hasPlayed = false
            game.setCurrentPhase = GamePhase.DISCUSSION
            game.resetRoundTurnState()
            game.startTurn()
        }else{
            // Calculo el siguiente turno
            game.computeNextTurn()
            game.startTurn()
        }
        return game
    }

    discuss({username,gameId}:PlayerReadyDto): Game | undefined{
        this.logger.info(`${username} timeout discussion Timer`)
        // Validaciones para ver si lanzo excepcion
        const game = this.validateGameExists(gameId)
        const player = this.validatePlayerExistsIngame(game, username)
        this.validatePlayerCanPlayInPhase(game, GamePhase.DISCUSSION, player)

        // Marco al jugador como listo para la siguiente etapa
        player.markHasPlayed()
        this.logger.info(`${player.name} Discussion TimeOut`)
        // Si todavia no estan todos listos, me miro el pupo esperando a que el ultimo llegue
        if(!game.allPlayed()) return
        
        this.logger.info(`End of discussion`)
        game.setCurrentPhase = GamePhase.VOTE
        game.resetRoundTurnState()
        game.startTurn() // Dejo el turno preparado para la siguiente fase
        return game
    }

    vote(submitVoteDto: SubmitVoteDto): Game{
        // Validaciones para ver si lanzo excepcion
        const game = this.validateGameExists(submitVoteDto.gameId)
        const player = this.validatePlayerExistsIngame(game, submitVoteDto.username)
        this.validatePlayerCanPlayInPhase(game, GamePhase.VOTE, player)

        // Creo el voto y lo agrego a la lista
        const vote = VoteFactory.createVote(submitVoteDto, game.getCurrentRound)
        game.addVote(vote)
        player.markHasPlayed()
        this.logger.info(`${player.name} has voted `, vote.votedPlayer)

        return game
    }
    computeGameResults(game: Game): Game {
        // Primero cuento votos
        const lossers = game.getMostVotedPlayers()
        this.logger.info(`Lossers of round ${game.getCurrentRound}: `, lossers)
        
        // Si hubo una sola con mayor cantidad de votos, la matamos. Si hay empate, no matamos a nadie y se sigue jugando
        if(lossers.length === 1){
            game.killPlayer(lossers[0])
        }
        
        const roundResult = RoundResultFactory.createRoundResultDto(game, lossers)
        game.addRoundResult(roundResult)
        this.logger.info("Round result: ", roundResult.expelledPlayer)
        
        // Si hubo ganador, lo logueamos y terminamos el juego.
        if(game.hasCrewWon(lossers) || game.hasImpostorWon(lossers)){
            gameManager.endGame(game.id)
            this.logger.info("Game Ended successfully: ", gameManager.getGameById(game.id))
        }

        // Configuro el Game para la siguiente ronda
        game.setCurrentPhase = GamePhase.ROUND_RESULT
        game.resetRoundTurnState()
        return game
    }

    nextRound({gameId, username}: PlayerReadyDto): Game | undefined{
        this.logger.warn(`Player ${username} is ready for next round`)
        const game = this.validateGameExists(gameId)
        const player = this.validatePlayerExistsIngame(game, username)
        if(game.getCurrentPhase !== GamePhase.ROUND_RESULT || player.played){
            this.logger.warn(`Player ${player.name} has played or game is incorrect`)
            return
        }
        
        player.markHasPlayed()
        if(!game.allPlayed()) return
        
        game.setCurrentPhase = GamePhase.PLAY
        game.resetRoundTurnState()
        game.computeFirstAvailableTurn()
        game.startTurn() // configuro el objeto Turn
        game.setCurrentRound = game.getCurrentRound + 1
        this.logger.warn(`Next round ready. First turn for ${game.getCurrentTurn.player} `, )
        return game
    }
}

export const gameService = new GameService(new ConsoleLogger(GameService.name))