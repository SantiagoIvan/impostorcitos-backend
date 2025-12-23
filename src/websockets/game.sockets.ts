import { Server, Socket } from "socket.io";
import { GameEvents, SubmitWordDto, SubmitVoteDto, PlayerReadyDto } from "../lib";
import { gameService } from "../services";
import { Game, gameManager, GameNotFoundError, GamePhase, Player, PlayerCantPlay, PlayerNotFoundError, VoteFactory, MoveFactory, RoundResultFactory } from "../domain";
import { ConsoleLogger } from "../logger";
import { toGameDTO } from "../mappers";

const logger = new ConsoleLogger("GAME_SOCKETS")

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
            const updatedGame = gameService.play(submitWordDto)
            gameService.updateGameStateToClient(updatedGame, GameEvents.WORD_SUBMITTED)

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
    socket.on(GameEvents.DISCUSSION_TURN_END, ({username,gameId}:PlayerReadyDto) => {
        try{
            const game = gameService.discuss({username,gameId})
            
            if(game) gameService.updateGameStateToClient(game, GameEvents.VOTE_TURN)
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
            const game = gameService.vote(submitVoteDto)
            
            gameService.updateGameStateToClient(game, GameEvents.VOTE_SUBMITTED)
           
            if(!game.allPlayed()) return

            const finalRoundGame = gameService.computeGameResults(game)
            // Le envio el resultado de la ronda a los jugadores si todos jugaron
            finalRoundGame.getPlayersAsList().forEach((player: Player) => {
                player.socket.emit(GameEvents.ROUND_RESULT, {game: toGameDTO(finalRoundGame, player.name), roundResult: finalRoundGame.getLastRoundResult()})
            })
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
    socket.on(GameEvents.NEXT_ROUND, ({gameId, username} : PlayerReadyDto) => {
        try{
            const game = gameService.nextRound({gameId, username})
            if(!game) return
            gameService.updateGameStateToClient(game, GameEvents.START_ROUND)
        }catch(error: any){
            logger.error(error.message)
        }
    })
}