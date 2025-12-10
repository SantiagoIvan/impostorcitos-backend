import { GameRepository } from "../repository";
import { Game, Player } from "../shared";
import { RandomGeneratorService } from "./randomGenerator.service";
import { RoomService } from "./room.service";

export const GameService = {
    createGame: (roomId: string) : Game => {
        const room = RoomService.getRoomById(roomId)
        const randomTopic = RandomGeneratorService.generateRandomTopic()
        const newGame = {
            id: "",
            room: RoomService.getRoomById(roomId),
            topic: randomTopic,
            secretWord: RandomGeneratorService.generateRandomWordFromTopic(randomTopic).toString(),
            activePlayers: [...room.players.map((player : Player) => {return {...player, isReady: false}})],
            impostor: RandomGeneratorService.generateRandomPlayer(room.players),
            rounds: [],
            impostorWonTheGame: false
        }
        GameRepository.createGame(newGame)
        return newGame
    },
    getGameById: (id: string): Game => {
        return GameRepository.getGameById(id)
    }
}