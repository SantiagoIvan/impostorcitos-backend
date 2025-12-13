import { randomInt } from "crypto";
import { GameRepository } from "../repository";
import { Game, PhaseGame, Player } from "../shared";
import { RandomGeneratorService } from "./randomGenerator.service";
import { RoomService } from "./room.service";

export const GameService = {
    createGame: (roomId: string) : Game => {
        const room = RoomService.getRoomById(roomId)
        const randomTopic = RandomGeneratorService.generateRandomTopic()
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
            nextTurnIndexPlayer: randomInt(0, room.players.length),
            currentPhase: PhaseGame.PLAY,
            currentRound: 0
        }
        GameRepository.createGame(newGame)
        return newGame
    },
    getGameById: (id: string): Game => {
        return GameRepository.getGameById(id)
    },
    computeNextTurn: (game: Game): Game => {
        // Itero sobre la lista de Active Players y me fijo cual es el siguiente en la lista que sigue vivo que no jugo

        return game
    }
    
}