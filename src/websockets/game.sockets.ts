import { Server, Socket } from "socket.io";
import { GameEvents, SubmitWordDto, GamePhase, SubmitVoteDto } from "../shared";
import { GameService, MoveService, PlayerService, RoomService, RoundResultService, VoteService } from "../services";
import { defaultMessages, defaultRooms, gamesInProgress, roomSocketUserMap } from "../db";

export const registerGameEvents = (socket: Socket, io: Server) => {
    socket.on(GameEvents.SUBMIT_WORD, (submitWordDto: SubmitWordDto) => {
        // Primero verifico que el jugador no haya jugado antes o que este muerto o que no sea la fase correcta. Si alguna se cumple, ignoro el mensaje
        // Cuando alguien hace una jugada, registro el Move en el array de Moves con el currentRound correspondiente
        // Le pongo el true el HasPlayed y genero el siguiente turno
        const game = GameService.getGameById(submitWordDto.gameId)
        if(
            !(game.currentPhase === GamePhase.PLAY) || 
            !PlayerService.canPlay(game, submitWordDto.username)
        ) return

        const move = MoveService.createMove(submitWordDto, game.currentRound)
        GameService.addMove(game, move)
        PlayerService.setPlayerHasPlayed(game.activePlayers, submitWordDto.username)
        
        // Verifico si todos jugaron para saber si activo la siguiente fase
        if(GameService.hasEverybodyPlayed(game)){
            // Actualizo la fase del juego y les seteo a todos de vuelta el flag hasPlayed = false
            GameService.setGamePhase(game, GamePhase.DISCUSSION)
            GameService.resetTurns(game)
            GameService.startTurn(game)
        }else{
            // Calculo el siguiente turno
            GameService.computeNextTurn(game, game.nextTurnIndexPlayer+1)
            GameService.startTurn(game)
        }
        io.to(game.room.id).emit(GameEvents.WORD_SUBMITTED, game)
    })

    socket.on(GameEvents.DISCUSSION_TURN_END, ({username,gameId}:{username: string, gameId: string}) => {
        const game = GameService.getGameById(gameId)
        if(
            !(game.currentPhase === GamePhase.DISCUSSION) || 
            !PlayerService.canPlay(game, username)
        ) return

        PlayerService.setPlayerHasPlayed(game.activePlayers, username)
        if(!GameService.hasEverybodyPlayed(game)) return 
        
        GameService.setGamePhase(game, GamePhase.VOTE)
        GameService.resetTurns(game)
        GameService.startTurn(game) // Dejo el turno preparado para la siguiente fase
        io.to(game.room.id).emit(GameEvents.VOTE_TURN, game)
        
    })

    socket.on(GameEvents.SUBMIT_VOTE, async (submitVoteDto: SubmitVoteDto) => {
        const game = GameService.getGameById(submitVoteDto.gameId)
        if(
            !(game.currentPhase === GamePhase.VOTE) || 
            !PlayerService.canPlay(game, submitVoteDto.username)
        ) return

        const vote = VoteService.createVote(submitVoteDto, game.currentRound)
        GameService.addVote(game, vote)
        PlayerService.setPlayerHasPlayed(game.activePlayers, submitVoteDto.username)
        

        io.to(game.room.id).emit(GameEvents.VOTE_SUBMITTED, game)

        // Verifico si todos jugaron
        if(!GameService.hasEverybodyPlayed(game)) return
        
        // Primero cuento votos
        const lossers = GameService.getMostVotedPlayers(game)
        
        GameService.setGamePhase(game, GamePhase.ROUND_RESULT)
        GameService.resetTurns(game)
        
        if(lossers.length === 1){
            GameService.killPlayer(game, lossers[0])
        }

        io.to(game.room.id).emit(GameEvents.ROUND_RESULT, {game, roundResult: RoundResultService.createRoundResultDto(game, lossers)})
        if(GameService.hasCrewWon(game, lossers) || GameService.hasImpostorWon(game, lossers)){
            console.log("[GAME_SOCKET] Limpiando roomUserSocketMap, mensajes del room, room y game")
            RoomService.removeRoom(game.room)
            GameService.removeGame(game)
            console.log("[GAME_SOCKET] Listo, se muestra a continuacion el estado de la ponele que BD")
            console.log(roomSocketUserMap)
            console.log(defaultRooms)
            console.log(gamesInProgress)
            console.log(defaultMessages) // Me falta agregar un roomId a los mensajes asi puedo eliminarlos
        }
    })

    socket.on(GameEvents.NEXT_ROUND, ({gameId, username} : {gameId: string, username: string}) => {
        const game = GameService.getGameById(gameId)
        if(!(game.currentPhase === GamePhase.ROUND_RESULT) || GameService.hasPlayerPlayed(game, username)) return
        PlayerService.setPlayerHasPlayed(game.activePlayers, username)
        

        if(!GameService.hasEverybodyPlayed(game)) return
        
        GameService.setGamePhase(game, GamePhase.PLAY)
        GameService.resetTurns(game)
        GameService.computeNextTurn(game, 0)
        GameService.startTurn(game) // configuro el objeto Turn
        GameService.setCurrentRound(game, game.currentRound + 1)
        io.to(game.room.id).emit(GameEvents.START_ROUND, game)
        
    })
}