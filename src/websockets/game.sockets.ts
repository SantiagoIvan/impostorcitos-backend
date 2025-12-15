import { Server, Socket } from "socket.io";
import { GameEvents, SubmitWordDto, GamePhase, SubmitVoteDto } from "../shared";
import { GameService, MoveService, PlayerService, RoundResultService, VoteService } from "../services";


export const registerGameEvents = (socket: Socket, io: Server) => {
    socket.on(GameEvents.SUBMIT_WORD, (submitWordDto: SubmitWordDto) => {
        // Primero verifico que el jugador no haya jugado antes. Si jugo, baaai
        // Cuando alguien hace una jugada, registro el Move en el array de Moves con el current round
        // Le pongo el true el HasPlayed
        const game = GameService.getGameById(submitWordDto.gameId)
        if(
            !(game.currentPhase === GamePhase.PLAY) || 
            GameService.hasPlayerPlayed(game, submitWordDto.username) || 
            !GameService.isPlayerDead(game, submitWordDto.username)
        ) return

        console.log("Registrando word para ", submitWordDto)
        const move = MoveService.createMove(submitWordDto, game.currentRound)
        GameService.addMove(game, move)
        PlayerService.setPlayerHasPlayed(game.activePlayers, submitWordDto.username)
        
        // Calculo el siguiente turno
        GameService.computeNextTurn(game)
        
        // Verifico si todos jugaron para saber si activo la siguiente fase
        if(GameService.hasEverybodyPlayed(game)){
            // Actualizo la fase del juego y les seteo a todos de vuelta el flag hasPlayed = false
            GameService.setGamePhase(game, GamePhase.DISCUSSION) 
            GameService.setNextTurnIndexPlayer(game, 0)
            GameService.resetHasPlayed(game)
        }
        io.to(game.room.id).emit(GameEvents.WORD_SUBMITTED, game)
    })

    socket.on(GameEvents.DISCUSSION_TURN_END, ({username,gameId}:{username: string, gameId: string}) => {
        const game = GameService.getGameById(gameId)
        if(
            !(game.currentPhase === GamePhase.DISCUSSION) || 
            GameService.hasPlayerPlayed(game, username) || 
            !GameService.isPlayerDead(game, username)
        ) return

        PlayerService.setPlayerHasPlayed(game.activePlayers, username)
        if(!GameService.hasEverybodyPlayed(game)) return 
        
        GameService.setGamePhase(game, GamePhase.VOTE)
        GameService.resetHasPlayed(game)
        io.to(game.room.id).emit(GameEvents.VOTE_TURN, game)
        
    })

    socket.on(GameEvents.SUBMIT_VOTE, async (submitVoteDto: SubmitVoteDto) => {
        const game = GameService.getGameById(submitVoteDto.gameId)
        if(
            !(game.currentPhase === GamePhase.VOTE) || 
            GameService.hasPlayerPlayed(game, submitVoteDto.username) || 
            !GameService.isPlayerDead(game, submitVoteDto.username)
        ) return

        console.log("Registrando voto para ", submitVoteDto)
        const vote = VoteService.createVote(submitVoteDto, game.currentRound)
        GameService.addVote(game, vote)
        PlayerService.setPlayerHasPlayed(game.activePlayers, submitVoteDto.username)
        
        io.to(game.room.id).emit(GameEvents.VOTE_SUBMITTED, game)

        // Verifico si todos jugaron
        if(!GameService.hasEverybodyPlayed(game)) return
        
        // Primero cuento votos
        const lossers = GameService.getMostVotedPlayers(game)
        
        GameService.setGamePhase(game, GamePhase.ROUND_RESULT)
        GameService.setNextTurnIndexPlayer(game, 0)
        GameService.resetHasPlayed(game)
        
        if(lossers.length === 1){
            GameService.killPlayer(game, lossers[0])
        }

        io.to(game.room.id).emit(GameEvents.ROUND_RESULT, {game, roundResult: RoundResultService.createRoundResultDto(game, lossers)})
        if(GameService.hasCrewWon(game, lossers) || GameService.hasImpostorWon(game, lossers)){
            console.log("Deberia limpiar memoria")
        }
    })

    socket.on(GameEvents.NEXT_ROUND, ({gameId, username} : {gameId: string, username: string}) => {
        const game = GameService.getGameById(gameId)
        if(!(game.currentPhase === GamePhase.ROUND_RESULT) || GameService.hasPlayerPlayed(game, username)) return
        PlayerService.setPlayerHasPlayed(game.activePlayers, username)
        

        if(!GameService.hasEverybodyPlayed(game)) return
        
        GameService.setGamePhase(game, GamePhase.PLAY)
        GameService.resetHasPlayed(game)
        GameService.setCurrentRound(game, game.currentRound + 1)
        io.to(game.room.id).emit(GameEvents.WORD_INPUT_TURN, game)
        
    })
}