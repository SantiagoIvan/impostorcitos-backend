import { Server, Socket } from "socket.io";
import { GameEvents, SubmitWordDto, SubmitVoteDto } from "../lib";
import { getNewGameService } from "../services";
import { gameManager, GamePhase, Player, VoteFactory } from "../domain";
import { ConsoleLogger } from "../logger";
import { MoveFactory } from "../domain";
import { RoundResultFactory } from "../domain/round";
import { toGameDTO } from "../mappers";

/*
*** GameEvents.Submit_Word
- Verificamos que la fase del juego sea Play y que el jugador pueda jugar (no haya jugado y este vivo).
- Creamos la jugada, la gregamos a la lista.
- Marcamos al jugador como que ya jugo.
- Si todos jugaron, cambiamos la fase del juego, reseteamos los flags y configuramos el turno.
    Sino, calculamos el siguiente turno.
- Emitimos el evento WORD_SUBMITTED para que todos continuen.
*/
const logger = new ConsoleLogger("GAME_SOCKETS")

export const registerGameEvents = (socket: Socket, io: Server) => {
    socket.on(GameEvents.SUBMIT_WORD, (submitWordDto: SubmitWordDto) => {
        const game = gameManager.getGameById(submitWordDto.gameId)
        if(!game){logger.error("Game no encontrado"); return}
        const player = game.getPlayerByName(submitWordDto.username)
        if(!game || !player) {logger.error("Jugador inexistente");return} // Aca deberia hacer una funcion de validacion y lanzar excepcion

        if(
            !(game.getCurrentPhase === GamePhase.PLAY) || 
            !player.canPlay()
        ) {logger.error("No es posible realizar una jugada");return}

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
    })

    socket.on(GameEvents.DISCUSSION_TURN_END, ({username,gameId}:{username: string, gameId: string}) => {
        const game = gameManager.getGameById(gameId)
        if(!game){logger.error("Game no encontrado"); return}
        const player = game.getPlayerByName(username)
        if(!game || !player) {logger.error("Jugador inexistente");return} // Aca deberia lanzar excepcion

        if(
            !(game.getCurrentPhase === GamePhase.DISCUSSION) || 
            !player.canPlay()
        ) {logger.error("No es posible realizar una jugada");return}

        player.markHasPlayed()
        logger.info(`${player.name} Discussion TimeOut`)
        if(!game.allPlayed()) return 
        
        logger.info(`End of discussion`)
        game.setCurrentPhase = GamePhase.VOTE
        game.resetRoundTurnState()
        game.startTurn() // Dejo el turno preparado para la siguiente fase
        getNewGameService().updateGameStateToClient(game, GameEvents.VOTE_TURN)
        
    })

    socket.on(GameEvents.SUBMIT_VOTE, async (submitVoteDto: SubmitVoteDto) => {
        const game = gameManager.getGameById(submitVoteDto.gameId)
        if(!game){logger.error("Game no encontrado"); return}
        const player = game.getPlayerByName(submitVoteDto.username)
        if(!game || !player) {logger.error("Jugador inexistente");return} // Aca deberia lanzar excepcion

        if(
            !(game.getCurrentPhase === GamePhase.VOTE) || 
            !player.canPlay()
        ) {logger.error("No es posible realizar una jugada");return}

        const vote = VoteFactory.createVote(submitVoteDto, game.getCurrentRound)
        game.addVote(vote)
        player.markHasPlayed()
        logger.info(`${player.name} has voted `, vote)

        getNewGameService().updateGameStateToClient(game, GameEvents.VOTE_SUBMITTED) // Por ahora en el front no hago nada pero podria ir mostrando una tablita con los votos

        // Verifico si todos jugaron
        if(!game.allPlayed()) return
        
        // Primero cuento votos
        const lossers = game.getMostVotedPlayers()
        logger.info(`Lossers of round ${game.getCurrentRound}: `, lossers)
        
        
        game.setCurrentPhase = GamePhase.ROUND_RESULT
        game.resetRoundTurnState()
        
        if(lossers.length === 1){
            game.killPlayer(lossers[0])
        }

        const roundResult = RoundResultFactory.createRoundResultDto(game, lossers)
        logger.info("Round result: ", roundResult)
        game.getPlayersAsList().forEach((player: Player) => {
            if(player.name === game.impostor){
                player.socket.emit(GameEvents.ROUND_RESULT, {game: toGameDTO(game, true), roundResult})
            }else{
                player.socket.emit(GameEvents.ROUND_RESULT, {game: toGameDTO(game), roundResult})
            }
        })
        if(game.hasCrewWon(lossers) || game.hasImpostorWon(lossers)){
            gameManager.endGame(game.id)
            logger.info("Game Ended successfully: ", gameManager.getGameById(game.id))
        }
    })

    socket.on(GameEvents.NEXT_ROUND, ({gameId, username} : {gameId: string, username: string}) => {
        const game = gameManager.getGameById(gameId)
        if(!game){logger.error("Game no encontrado"); return}
        const player = game.getPlayerByName(username)
        if(!game || !player) {logger.error("Jugador inexistente");return} // Aca deberia lanzar excepcion

        if(!(game.getCurrentPhase === GamePhase.ROUND_RESULT) || player.played) return
        
        player.markHasPlayed()

        if(!game.allPlayed()) return
        
        game.setCurrentPhase = GamePhase.PLAY
        game.resetRoundTurnState()
        game.computeFirstAvailableTurn()
        game.startTurn() // configuro el objeto Turn
        game.setCurrentRound = game.getCurrentRound + 1
        getNewGameService().updateGameStateToClient(game, GameEvents.START_ROUND)
        
    })
}