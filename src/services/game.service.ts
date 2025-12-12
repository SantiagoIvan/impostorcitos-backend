import { randomInt } from "crypto";
import { GameRepository } from "../repository";
import { Game, Player } from "../shared";
import { RandomGeneratorService } from "./randomGenerator.service";
import { RoomService } from "./room.service";
import { Socket } from "socket.io";
import { gamesInProgress } from "../db";

export const GameService = {
    createGame: (roomId: string) : Game => {
        const room = RoomService.getRoomById(roomId)
        const randomTopic = RandomGeneratorService.generateRandomTopic()
        const newGame = {
            id: "", // lo setea el repository usando un seq, como si lo hiciera la DB
            room: RoomService.getRoomById(roomId),
            topic: randomTopic,
            secretWord: RandomGeneratorService.generateRandomWordFromTopic(randomTopic).toString(),
            activePlayers: [...room.players.map((player : Player) => {return {...player, isReady: false}})],
            impostor: RandomGeneratorService.generateRandomPlayer(room.players),
            moves: [],
            votes: [],
            impostorWonTheGame: false,
            nextTurnIndexPlayer: randomInt(0, room.players.length)
        }
        GameRepository.createGame(newGame)
        return newGame
    },
    getGameById: (id: string): Game => {
        return GameRepository.getGameById(id)
    }
    
}