import { io } from "../.."
import { gameManager, GameNotFoundError, Player } from "../../domain"
import { GameEvents, PlayerLeftGameDto, PlayerReadyDto, RestartGameDto, RoomEvents, SubmitVoteDto, SubmitWordDto } from "../../lib"
import { ConsoleLogger } from "../../logger"
import { toGameDTO } from "../../mappers"
import { toVoteArrayDTO } from "../../mappers/vote.mapper"
import { gameService } from "../../services"

const logger = new ConsoleLogger("GAME_SOCKETS")

export function onSubmitWord(submitWordDto: SubmitWordDto) {
    try{
        const updatedGame = gameService.play(submitWordDto)
        gameService.updateGameStateToClient(updatedGame, GameEvents.WORD_SUBMITTED)

    }catch(error: any){
        logger.error(error.message)
    }
}

export function onDiscussionTurnEnd({username,gameId}:PlayerReadyDto){
    try{
        const game = gameService.discuss({username,gameId})
        
        if(game) gameService.updateGameStateToClient(game, GameEvents.VOTE_TURN)
    }catch(error: any){
        logger.error(error.message)
    }
}

export function onSubmitVote(submitVoteDto: SubmitVoteDto){
    try{
        // Al momento de votar se verifica si ya voto antes en la misma ronda, cosa de no contar 2 veces.
        const game = gameService.vote(submitVoteDto)
        logger.info(`Game ${submitVoteDto.gameId}: ${submitVoteDto.username} has voted for ${submitVoteDto.targetPlayer}`)
        io.to(game.id).emit(GameEvents.VOTE_SUBMITTED, toVoteArrayDTO(game.getVotes()))
        
        if(!game.allPlayed()) return

        
        const finalRoundGame = gameService.computeGameResults(game)
        // Le envio el resultado de la ronda a los jugadores si todos jugaron
        finalRoundGame.getPlayersAsList().forEach((player: Player) => {
            player.socket?.emit(GameEvents.ROUND_RESULT, {game: toGameDTO(finalRoundGame, player.name), roundResult: finalRoundGame.getLastRoundResult()})
        })

        logger.info("Votation ended")
    }catch(error: any){
        logger.error(error.message)
    }
}

export function onNextRound({gameId, username} : PlayerReadyDto){
    try{
        const game = gameService.nextRound({gameId, username})
        if(!game) return
        gameService.updateGameStateToClient(game, GameEvents.START_ROUND)
    }catch(error: any){
        logger.error(error.message)
    }
}

export function onPlayerDisconnect(playerLeftDto: PlayerLeftGameDto) {
    try{
        gameService.handlePlayerDisconnected(playerLeftDto.username, playerLeftDto.gameId)
    }catch(error: any){
        logger.error(error.message)
    }
}

export function onRestart(restartGameDto: RestartGameDto){
    try {
        logger.warn(`Restarting GAME: ${restartGameDto.gameId} with NEW TOPIC: ${restartGameDto.newTopic} and RANDOM FLAG: ${restartGameDto.randomFlag}. Sending event to connected players...`)
        const newGame = gameService.restart(restartGameDto)
        newGame.getPlayersAsList().forEach((player: Player) => {
            player.socket?.emit(GameEvents.START_ROUND, toGameDTO(newGame, player.name))
        })
    } catch (error: any) {
        logger.error(error.message)
        io.to(restartGameDto.gameId).emit(GameEvents.END_GAME)
    }
}