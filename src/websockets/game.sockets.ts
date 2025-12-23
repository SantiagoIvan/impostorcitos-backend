import { Server, Socket } from "socket.io";
import { GameEvents, SubmitWordDto, SubmitVoteDto } from "../lib";
import { getNewGameService } from "../services";
import { Game, gameManager, GameNotFoundError, GamePhase, Player, PlayerCantPlay, PlayerNotFoundError, VoteFactory } from "../domain";
import { ConsoleLogger } from "../logger";
import { MoveFactory } from "../domain";
import { RoundResultFactory } from "../domain/round";
import { toGameDTO } from "../mappers";

const logger = new ConsoleLogger("GAME_SOCKETS")

function validateGameExists(gameId: string): Game{
    const game = gameManager.getGameById(gameId)
    if(!game) throw new GameNotFoundError(gameId)
    return game
}

function validatePlayerExists(game: Game, name: string): Player{
    const player = game.getPlayerByName(name)
    if(!player) throw new PlayerNotFoundError(name, game.id)
    return player
}

function validatePlayerCanPlayInPhase(game: Game, targetPhase: GamePhase, player: Player){
    if(
        (game.getCurrentPhase !== targetPhase) || 
        !player.canPlay()
    ) throw new PlayerCantPlay(player.name, game.id)
}

export const registerGameEvents = (socket: Socket, io: Server) => {
    /*
    *** GameEvents.Submit_Word
    - Verificamos que la fase del juego sea Play y que el jugador pueda jugar (no haya jugado y este vivo).
    - Creamos la jugada, la gregamos a la lista.
    - Marcamos al jugador como que ya jugo.
    - Si todos jugaron, cambiamos la fase del juego, reseteamos los flags y configuramos el turno.
        Sino, calculamos el siguiente turno.
    - Emitimos el evento WORD_SUBMITTED para que todos continuen.
    */
    socket.on(GameEvents.SUBMIT_WORD, (submitWordDto: SubmitWordDto) => {
        try{
            const game = validateGameExists(submitWordDto.gameId)
            const player = validatePlayerExists(game, submitWordDto.username)
            validatePlayerCanPlayInPhase(game, GamePhase.PLAY, player)
    
            const move = MoveFactory.createMove(submitWordDto, game.getCurrentRound)
            game.addMove(move)
            player.markHasPlayed()
            logger.info(`${player.name} has played `, move)
            // Verifico si todos jugaron para saber si activo la siguiente fase
            if(game.allPlayed()){
                // Actualizo la fase del juego y les seteo a todos de vuelta el flag hasPlayed = false
                game.setCurrentPhase = GamePhase.DISCUSSION
                game.resetRoundTurnState()
                game.startTurn()
            }else{
                // Calculo el siguiente turno
                game.computeNextTurn()
                game.startTurn()
            }
            getNewGameService().updateGameStateToClient(game, GameEvents.WORD_SUBMITTED)

        }catch(error: any){
            logger.error(error.message)
        }
    })

    /*
    *** GameEvents.Discussion_Turn_End
    - Verificamos que la fase del juego sea Discussion y que el jugador pueda jugar (no haya jugado y este vivo).
    - Cuando al jugador se le termina el timer, dispara este evento avisando que ya esta listo para avanzar.
    - Marcamos al jugador como Ready.
    - Si todos estan listos, cambiamos la fase del juego, reseteamos los flags y configuramos el turno.
        Sino, esperamos al resto.
    - Emitimos el evento VOTE_TURN para que todos continuen con la siguiente fase.
    */
    socket.on(GameEvents.DISCUSSION_TURN_END, ({username,gameId}:{username: string, gameId: string}) => {
        try{
            const game = validateGameExists(gameId)
            const player = validatePlayerExists(game, username)
            validatePlayerCanPlayInPhase(game, GamePhase.DISCUSSION, player)
    
            player.markHasPlayed()
            logger.info(`${player.name} Discussion TimeOut`)
            if(!game.allPlayed()) return 
            
            logger.info(`End of discussion`)
            game.setCurrentPhase = GamePhase.VOTE
            game.resetRoundTurnState()
            game.startTurn() // Dejo el turno preparado para la siguiente fase
            getNewGameService().updateGameStateToClient(game, GameEvents.VOTE_TURN)
        }catch(error: any){
            logger.error(error.message)
        }
        
    })



    /*
    *** GameEvents.Submit_Vote
    - Verificamos que la fase del juego sea Vote y que el jugador pueda jugar (no haya jugado y este vivo).
    - Cuando al jugador se le termina el timer o clickea en Votar, dispara este evento notificando el voto.
    - Creamos el voto y lo agregamos a la lista
    - Marcamos al jugador como Ready.
    - Notificamos al resto de los jugadores que cierto jugador fue votado (EL VOTO ES SECRETO ASI QUE EN EL DTO NO DECIMOS QUIEN FUE)
    - Si todos votaron, se calculan los lossers, una lista de jugadores mas votados. Si la longitud es 1 quiere decir que hay un perdedor. 
    Si hay varios, es un empate y se juega de vuelta
    - Se crea el objeto para informar el resultado de la ronda
    - Se notifica el resultado.
    - Si hubo ganador, se borra la partida. Sino, se emite el evento de ROUND_RESULT y se espera a que todos hagan Click en Continuar para
    recibir el evento NEXT_ROUND y jugar de vuelta
    */
    socket.on(GameEvents.SUBMIT_VOTE, async (submitVoteDto: SubmitVoteDto) => {
        try{
            const game = validateGameExists(submitVoteDto.gameId)
            const player = validatePlayerExists(game, submitVoteDto.username)
            validatePlayerCanPlayInPhase(game, GamePhase.VOTE, player)

            const vote = VoteFactory.createVote(submitVoteDto, game.getCurrentRound)
            game.addVote(vote)
            player.markHasPlayed()
            logger.info(`${player.name} has voted `, vote)

            // Por ahora en el front no hago nada pero podria ir mostrando una tablita con los votos
            getNewGameService().updateGameStateToClient(game, GameEvents.VOTE_SUBMITTED)

            // Verifico si todos jugaron
            if(!game.allPlayed()) return
            
            // Primero cuento votos
            const lossers = game.getMostVotedPlayers()
            logger.info(`Lossers of round ${game.getCurrentRound}: `, lossers)
            
            // Configuro el Game para la siguiente ronda
            game.setCurrentPhase = GamePhase.ROUND_RESULT
            game.resetRoundTurnState()
            
            // Si hubo una sola con mayor cantidad de votos, la matamos. Si hay empate, no matamos a nadie y se sigue jugando
            if(lossers.length === 1){
                game.killPlayer(lossers[0])
            }

            const roundResult = RoundResultFactory.createRoundResultDto(game, lossers)
            logger.info("Round result: ", roundResult)

            // Le envio el resultado de la ronda a los jugadores
            game.getPlayersAsList().forEach((player: Player) => {
                player.socket.emit(GameEvents.ROUND_RESULT, {game: toGameDTO(game, player.name), roundResult})
            })

            // Si hubo ganador, lo logueamos y terminamos el juego.
            if(game.hasCrewWon(lossers) || game.hasImpostorWon(lossers)){
                gameManager.endGame(game.id)
                logger.info("Game Ended successfully: ", gameManager.getGameById(game.id))
            }
        }catch(error: any){
            logger.error(error.message)
        }
    })



    /*
    *** GameEvents.Next_Round
    - Verificamos que la fase del juego sea ROUND_RESULT y que el jugador pueda jugar (no haya jugado y este vivo).
    - Cuando al jugador clickea en Continuar en el Modal de RoundResult, dispara el evento Next_round, avisando que esta listo para continuar jugando
    - Marcamos al jugador como listo
    - Si no estan todos listos, esperamos al resto.
    - Si ya estan todos listos, configuramos el juego para la siguiente fase, que es la primera del principio, con la siguiente ronda
    Calculamos tambien cual es el primer turno, siguiendo el orden que calculamos al inicio de la partida.
    */
    socket.on(GameEvents.NEXT_ROUND, ({gameId, username} : {gameId: string, username: string}) => {
        try{
            const game = validateGameExists(gameId)
            const player = validatePlayerExists(game, username)
            validatePlayerCanPlayInPhase(game, GamePhase.ROUND_RESULT, player)
            
            player.markHasPlayed()

            if(!game.allPlayed()) return
            
            game.setCurrentPhase = GamePhase.PLAY
            game.resetRoundTurnState()
            game.computeFirstAvailableTurn()
            game.startTurn() // configuro el objeto Turn
            game.setCurrentRound = game.getCurrentRound + 1
            getNewGameService().updateGameStateToClient(game, GameEvents.START_ROUND)
        }catch(error: any){
            logger.error(error.message)
        }
    })
}