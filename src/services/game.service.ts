import { RoomEvents, GameEvents, SubmitWordDto, PlayerReadyDto, SubmitVoteDto, RestartGameDto } from "../lib";
import { toGameDTO } from "../mappers";
import { Game, gameManager, GameNotFoundError, Player, PlayerNotFoundError, GamePhase, PlayerCantPlay, MoveFactory, VoteFactory, RoundResultFactory, TurnTimer, Vote, Move } from "../domain";
import { ConsoleLogger, ILogger } from "../logger";
import { io } from "..";


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
        ) {
            console.log("No paso de validatePlayer", player, targetPhase, game)
            throw new PlayerCantPlay(player.name, game.id)
        }
    }
    validatePlayerHasntVoted(game: Game, player: Player){
        // Antes de crear el voto me fijo si ya voto en esta ronda.
        if(game.getVotes().some((vote: Vote) => vote.roundId === game.getCurrentRound && vote.player === player.name)){
            this.logger.warn(`El usuario ${player.name} ya voto. Seguramente se le vencio el turno.`)
            throw new PlayerCantPlay(player.name, game.id)
        }
    }
    validatePlayerHasntMoved(game: Game, player: Player){
        // Antes de crear la jugada me fijo si ya voto en esta ronda.
        if(game.getMoves().some((move: Move) => move.roundId === game.getCurrentRound && move.player === player.name)){
            this.logger.warn(`El usuario ${player.name} ya jugo. Seguramente se le vencio el turno.`)
            throw new PlayerCantPlay(player.name, game.id)
        }
    }
    updateGameStateToClient(game: Game, event: RoomEvents | GameEvents) {
        game.getPlayersAsList().forEach((player: Player) => {
            const gameDto = toGameDTO(game, player.name)
            player.socket?.emit(event, gameDto)
        })
    }

    play(submitWordDto: SubmitWordDto): Game{
        // Validaciones para ver si lanzo excepcion
        this.logger.info(`${submitWordDto.username} played ${submitWordDto.word}`)
        const game = this.validateGameExists(submitWordDto.gameId)
        const player = this.validatePlayerExistsIngame(game, submitWordDto.username)
        this.validatePlayerCanPlayInPhase(game, GamePhase.PLAY, player)
        this.validatePlayerHasntMoved(game, player)

        // Creacion de la Jugada
        const move = MoveFactory.createMove(submitWordDto, game.getCurrentRound)
        game.addMove(move)
        game.updateLastActivity()
        player.markHasPlayed()
        this.logger.info(`${player.name} has successfully played `, move.word)

        // Verifico si todos jugaron para saber si activo la siguiente fase
        if(game.allPlayed()){
            // Si todos jugaron, cierro el timer
            const turnTimer = game.getTurnTimer()
            if(turnTimer) clearTimeout(turnTimer.timeout)
            this.logger.warn("Starting discussion phase")
            // Actualizo la fase del juego y les seteo a todos de vuelta el flag hasPlayed = false
            game.setCurrentPhase = GamePhase.DISCUSSION
            game.resetPlayersState()
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
        
        // Si todos jugaron, cierro el timer
        const turnTimer = game.getTurnTimer()
        if(turnTimer) clearTimeout(turnTimer.timeout)

        this.logger.info(`End of discussion`)
        game.setCurrentPhase = GamePhase.VOTE
        game.resetPlayersState()
        game.updateLastActivity()
        game.startTurn() // Dejo el turno preparado para la siguiente fase
        return game
    }

    vote(submitVoteDto: SubmitVoteDto): Game{
        // Validaciones para ver si lanzo excepcion
        const game = this.validateGameExists(submitVoteDto.gameId)
        const player = this.validatePlayerExistsIngame(game, submitVoteDto.username)
        this.validatePlayerCanPlayInPhase(game, GamePhase.VOTE, player)
        this.validatePlayerHasntVoted(game, player)
        
        // Creo el voto y lo agrego a la lista. Si el voto es nulo, no lo agrego
        if(submitVoteDto.targetPlayer !== ""){
            const vote = VoteFactory.createVote(submitVoteDto, game.getCurrentRound)
            game.addVote(vote)
        }
        game.updateLastActivity()
        player.markHasPlayed()
        this.logger.info(`${player.name} has voted `, submitVoteDto.targetPlayer)

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

        // Configuro el Game para la siguiente ronda
        game.setCurrentPhase = GamePhase.ROUND_RESULT
        game.resetPlayersState()
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
        game.updateLastActivity()
        if(!game.allPlayed()) return
        
        game.setCurrentPhase = GamePhase.PLAY
        game.resetPlayersState()
        game.computeFirstAvailableTurn()
        game.startTurn() // configuro el objeto Turn y el timer
        game.setCurrentRound = game.getCurrentRound + 1
        this.logger.warn(`Next round ready. First turn for ${game.getCurrentTurn.player} `, )
        return game
    }

    endGame(gameId: string){
        try{
            gameManager.endGame(gameId)
            this.logger.info("Game Ended successfully: ID ", gameId)
            
        }catch(error: any){
            this.logger.error(error.message)
        }

    }
    restart(restartGameDto: RestartGameDto){
        const game = gameManager.getGameById(restartGameDto.gameId)
        if(!game) throw new GameNotFoundError(restartGameDto.gameId)

        // Reseteo la partida
        game.restart(restartGameDto.newTopic, restartGameDto.randomFlag)

        console.log("Restarted ", game)
        return game
    }
    handlePlayerDisconnected(playerName: string, gameId: string) {
        this.logger.info(`Se desconecto un jugador: ${playerName} del game: ${gameId}. vamos a ver si la partida sigue o que onda`)
    
        const game = gameManager.getGameById(gameId)
        if(!game) throw new GameNotFoundError(gameId)

        const playerFound = game.getPlayerByName(playerName)
        if(!playerFound || !playerFound.connected) {
            throw new Error(`Se desconecto un jugador: ${playerName} del game: ${gameId}. No estaba conectado asi que vale verga o no se lo encontro`)
        }

        // Desconectamos al jugador
        game.disconnectPlayer(playerName)

        // Emitir que se desconecto uno
        io.to(game.id).emit(GameEvents.PLAYER_LEFT_GAME, {playerName, game: toGameDTO(game)})

        // Si esta muerto, no genero una nueva ronda, la idea es que si se va uno que se murio, me chupe un huevo
        if(game.validStateToPlay() ){
            // Terminar Round, y reconfigurar el game para luego enviar la nueva ronda
            this.logger.info(`Valido para seguir jugando, vamos a ver si salteo el turno`)
            const gameWithRoundResult = this.playerLeftRoundResult(playerName, game)
            gameWithRoundResult.resetPlayersState()
            gameWithRoundResult.getPlayersAsList().forEach((player: Player) => {
                player.socket?.emit(GameEvents.ROUND_RESULT, {game: toGameDTO(gameWithRoundResult, player.name), roundResult: gameWithRoundResult.getLastRoundResult()})
            })
        }else{
            // Abortar para luego emitir END Game.
            this.logger.info(`Abortando partida...`)
            game.abort()
            gameManager.endGame(game.id)
            game.getConnectedPlayers().forEach((player: Player) => {
                player.socket?.emit(GameEvents.END_GAME, {game: toGameDTO(game, player.name), roundResult: game.getLastRoundResult()})
            })
            game.cleanup()
        }
    }
    playerLeftRoundResult(playerName: string, game: Game): Game {
        game.setCurrentPhase = GamePhase.ROUND_RESULT
        const roundResult = RoundResultFactory.createRoundResultDto(game, [playerName])
        game.addRoundResult(roundResult)
        return game
    }
}

export const gameService = new GameService(new ConsoleLogger(GameService.name))