import { Socket } from "socket.io";
import { Vote, getPlayersWithMostVotes, RoomEvents, GameEvents } from "../lib";
import { toGameDTO } from "../mappers";
import { Game, Player } from "../domain";
import { ConsoleLogger, ILogger } from "../logger";


export class GameService {
    constructor(
        private readonly logger: ILogger
      ){}
    /*computeNextTurn(game: Game, baseIndex: number): void {
        // Itero sobre la lista de Active Players y me fijo cual es el siguiente en la lista que sigue vivo que no jugo
        while(baseIndex < game.orderToPlay.length){
            const player = game.activePlayers.find((player: Player) => player.name === game.orderToPlay[baseIndex])
            if(player && player.isAlive && !player.hasPlayed) {
                game.nextTurnIndexPlayer = baseIndex
                return
            }
            baseIndex += 1
        }
        console.log("No hay turno disponible")
    }
    hasEverybodyPlayed(game: Game): boolean { return game.activePlayers.filter((player : Player) => player.isAlive).every((player: Player) => player.hasPlayed) }
    hasPlayerPlayed(game: Game, username: string): boolean { return game.activePlayers.find((player: Player) => player.name === username)?.hasPlayed || false }
    resetTurns(game: Game): void {
        game.activePlayers.forEach((p: Player) => {p.hasPlayed = false})
        game.nextTurnIndexPlayer = 0
    }
    setGamePhase(game: Game, gamePhased: GamePhase) {
        game.currentPhase = gamePhased
    }
    setNextTurnIndexPlayer(game: Game, turn: number) {
        game.nextTurnIndexPlayer = turn
    }
    setCurrentRound(game: Game, round: number) {
        game.currentRound = round
    }
    setImpostor(game: Game, impostor: string) {
        game.impostor = impostor
    }
    setImpostorWonTheGame(game: Game, flag: boolean) {
        game.impostorWonTheGame = flag
    }
    addMove(game: Game, move:Move) {
        game.moves.push(move)
    }
    addVote(game: Game, vote:Vote) {
        game.votes.push(vote)
    }
    getMostVotedPlayers(game: Game): string[] {
        const voteMap = new Map<string, number>()
        game.votes.filter((vote: Vote) => vote.roundId === game.currentRound).forEach((vote: Vote) => {
            if(vote.votedPlayer === "") return
            const votesGivenToPlayer = voteMap.get(vote.votedPlayer) || 0
            voteMap.set(vote.votedPlayer, votesGivenToPlayer + 1)
        })
        // Una vez realizado el conteo, tengo cual es el numero maximo de votos y quienes tienen ese numero
        const { playerIds } = getPlayersWithMostVotes(voteMap);
        return playerIds
    }
    hasCrewWon(game: Game, lossers: string[]) { return lossers.length === 1 && lossers[0] === game.impostor}
    hasImpostorWon(game: Game, lossers: string[]){
        return game.activePlayers.filter((player: Player) => player.isAlive).length === 2 
            && lossers.length === 1 
            && lossers[0] !== game.impostor
    }
    isPlayerDead(game: Game, playerName: string) { return game.activePlayers.some((player: Player) => player.name === playerName && player.isAlive)}
    killPlayer(game: Game, playerName: string) {
        const player = game.activePlayers.find((player: Player) => player.name === playerName)
        if(player){
            player.isAlive = false
        }
        const socketPlayer = SocketUsersService.getSocketPlayer(game.room.id, playerName)
        if(socketPlayer){
            console.log("Agregado al canal de muertos")
            socketPlayer?.join(`${game.room.id}:dead`)
        }
    }
    removeGame(gameId: string) {
        GameRepository.removeGame(gameId)
    }
    cleanUpGame(game: Game) {
        console.log("[GAME_SERVICE] Limpiando roomUserSocketMap, mensajes del room, room, game y listeners del game")
        // faltan los listeners para cada socket
        MessageService.cleanUpMessagesFromRoom(game.room.id)
        SocketUsersService.removeEntryMap(game.room.id)
        RoomService.cleanUpRoom(game.room.id)
        GameService.removeGame(game.id)
    }*/
    updateGameStateToClient(game: Game, event: RoomEvents | GameEvents) {
        game.getPlayersAsList().forEach((player: Player) => {
            if(player.name === game.impostor){
                const gameDto = toGameDTO(game, true)
                this.logger.info("Game has been sent to impostor", gameDto)
                player.socket.emit(event, gameDto)
            }else{
                const gameDto = toGameDTO(game)
                this.logger.info("Game has been sent to crew", gameDto)
                player.socket.emit(event, gameDto)
              }
            })
    }
}

export const getNewGameService = () => new GameService(new ConsoleLogger(GameService.name))