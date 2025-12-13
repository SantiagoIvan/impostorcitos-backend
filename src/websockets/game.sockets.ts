import { Server, Socket } from "socket.io";
import { Game, GameEvents, SubmitWordDto, PhaseGame, SubmitVoteDto } from "../shared";
import { GameService, MoveService, PlayerService, VoteService } from "../services";


function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const registerGameEvents = (socket: Socket, io: Server) => {
    socket.on(GameEvents.SUBMIT_WORD, (submitWordDto: SubmitWordDto) => {
        // Primero verifico que el jugador no haya jugado antes. Si jugo, baaai
        // Cuando alguien hace una jugada, registro el Move en el array de Moves con el current round
        // Le pongo el true el HasPlayed
        const game = GameService.getGameById(submitWordDto.gameId)
        if(!(game.currentPhase === PhaseGame.PLAY) || GameService.hasPlayerPlayed(game, submitWordDto.username)) return

        console.log("Registrando word para ", submitWordDto)
        const move = MoveService.createMove(submitWordDto, game.currentRound)
        game.moves.push(move)
        PlayerService.setPlayerHasPlayed(game.activePlayers, submitWordDto.username)
        
        // Calculo el siguiente turno
        GameService.computeNextTurn(game)
        
        // Verifico si todos jugaron para saber si activo la siguiente fase
        if(GameService.hasEverybodyPlayed(game)){
            // Actualizo la fase del juego y les seteo a todos de vuelta el flag hasPlayed = false
            game.currentPhase = PhaseGame.DISCUSSION
            game.nextTurnIndexPlayer = 0
            GameService.resetHasPlayed(game)
        }
        io.to(game.room.id).emit(GameEvents.WORD_SUBMITTED, game)
    })

    socket.on(GameEvents.DISCUSSION_TURN_END, ({username,gameId}:{username: string, gameId: string}) => {
        const game = GameService.getGameById(gameId)
        if(!(game.currentPhase === PhaseGame.DISCUSSION) || GameService.hasPlayerPlayed(game, username)) return
        PlayerService.setPlayerHasPlayed(game.activePlayers, username)

        console.log("[DISCUSSION] players ", game.activePlayers)
        if(GameService.hasEverybodyPlayed(game)){
            GameService.resetHasPlayed(game)

            game.currentPhase = PhaseGame.VOTE
            io.to(game.room.id).emit(GameEvents.VOTE_TURN, game)
        }
    })

    socket.on(GameEvents.SUBMIT_VOTE, async (submitVoteDto: SubmitVoteDto) => {
        const game = GameService.getGameById(submitVoteDto.gameId)
        if(!(game.currentPhase === PhaseGame.VOTE) || GameService.hasPlayerPlayed(game, submitVoteDto.username)) return

        console.log("Registrando voto para ", submitVoteDto)
        const vote = VoteService.createVote(submitVoteDto, game.currentRound)
        game.votes.push(vote)
        PlayerService.setPlayerHasPlayed(game.activePlayers, submitVoteDto.username)
        
        io.to(game.room.id).emit(GameEvents.VOTE_SUBMITTED, game)
        // Verifico si todos jugaron
        if(GameService.hasEverybodyPlayed(game)){
            // Primero verifico condicion de victoria
            // Actualizo la fase del juego y les seteo a todos de vuelta el flag hasPlayed = false
            await sleep(3000);// aca puedo emitir resultados de la expulsion
            game.currentPhase = PhaseGame.PLAY
            game.currentRound += 1
            game.nextTurnIndexPlayer = 0
            GameService.resetHasPlayed(game)
            io.to(game.room.id).emit(GameEvents.WORD_INPUT_TURN, game)
        }
    })
}