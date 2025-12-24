import { Player } from "../../domain"
import { GameEvents, PlayerReadyDto, SubmitVoteDto, SubmitWordDto } from "../../lib"
import { ConsoleLogger, ILogger } from "../../logger"
import { toGameDTO } from "../../mappers"
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