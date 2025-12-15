import { GameRepository } from "../repository";
import { Game, Move, GamePhase, Player, Vote } from "../shared";
import { RandomGeneratorService } from "./randomGenerator.service";
import { RoomService } from "./room.service";
import { shuffle } from "../shared";
import { getPlayersWithMostVotes } from "../shared/utils";



export const GameService = {
    createGame: (roomId: string) : Game => {
        const room = RoomService.getRoomById(roomId)
        const randomTopic = RandomGeneratorService.generateRandomTopic()
        const randomOrder = shuffle([...room.players.map((player: Player) => player.name)])
        const newGame = {
            id: "", // lo setea el repository usando un seq, como si lo hiciera la DB
            room: RoomService.getRoomById(roomId),
            topic: randomTopic,
            secretWord: RandomGeneratorService.generateRandomWordFromTopic(randomTopic).toString(),
            activePlayers: [...room.players.map((player : Player) => {return {...player, isReady: false}})], // el IsReady en false porque viene true, porque es el que uso para el Ready del room
            impostor: RandomGeneratorService.generateRandomPlayer(room.players),
            moves: [],
            votes: [],
            impostorWonTheGame: false,
            nextTurnIndexPlayer: 0,
            orderToPlay: randomOrder,
            currentPhase: GamePhase.PLAY,
            currentRound: 1
        }
        GameRepository.createGame(newGame)
        return newGame
    },
    getGameById: (id: string): Game => {
        return GameRepository.getGameById(id)
    },
    computeNextTurn: (game: Game): void => {
        // Itero sobre la lista de Active Players y me fijo cual es el siguiente en la lista que sigue vivo que no jugo
        let currentIndex = game.nextTurnIndexPlayer + 1
        while(currentIndex < game.orderToPlay.length){
            const player = game.activePlayers.find((player: Player) => player.name === game.orderToPlay[currentIndex])
            if(player && player.isAlive && !player.hasPlayed) {
                game.nextTurnIndexPlayer = currentIndex
                return
            }
            currentIndex += 1
        }
    },
    hasEverybodyPlayed: (game: Game): boolean => game.activePlayers.filter((player : Player) => player.isAlive).every((player: Player) => player.hasPlayed),
    hasPlayerPlayed: (game: Game, username: string): boolean => game.activePlayers.find((player: Player) => player.name === username)?.hasPlayed || false,
    resetHasPlayed: (game: Game): void => {
        game.activePlayers.forEach((p: Player) => {p.hasPlayed = false})
    },
    setGamePhase: (game: Game, gamePhased: GamePhase) => {
        game.currentPhase = gamePhased
    },
    setNextTurnIndexPlayer: (game: Game, turn: number) =>{
        game.nextTurnIndexPlayer = turn
    },
    setCurrentRound: (game: Game, round: number) =>{
        game.currentRound = round
    },
    setImpostor: (game: Game, impostor: string) =>{
        game.impostor = impostor
    },
    setImpostorWonTheGame: (game: Game, flag: boolean) =>{
        game.impostorWonTheGame = flag
    },
    addMove: (game: Game, move:Move) => {
        game.moves.push(move)
    },
    addVote: (game: Game, vote:Vote) => {
        game.votes.push(vote)
    },
    getMostVotedPlayers: (game: Game): string[] => {
        const voteMap = new Map<string, number>()
        game.votes.filter((vote: Vote) => vote.roundId === game.currentRound).forEach((vote: Vote) => {
            if(vote.votedPlayer === "") return
            const votesGivenToPlayer = voteMap.get(vote.votedPlayer) || 0
            voteMap.set(vote.votedPlayer, votesGivenToPlayer + 1)
        })
        // Una vez realizado el conteo, tengo cual es el numero maximo de votos y quienes tienen ese numero
        const { playerIds } = getPlayersWithMostVotes(voteMap);
        return playerIds
    },
    hasCrewWon: (game: Game, lossers: string[]) => lossers.length === 1 && lossers[0] === game.impostor,
    hasImpostorWon: (game: Game, lossers: string[]) => 
        game.activePlayers.filter((player: Player) => player.isAlive).length === 2 
            && lossers.length === 1 
            && lossers[0] !== game.impostor,
    isPlayerDead: (game: Game, playerName: string) => game.activePlayers.some((player: Player) => player.name === playerName && player.isAlive),
}