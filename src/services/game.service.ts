import { GameRepository } from "../repository";
import { Game, Player } from "../shared";
import { PlayerService } from "./player.service";
import { RoomService } from "./room.service";

export const GameService = {
    createGame: (roomId: string) : Game => {
        const room = RoomService.getRoomById(roomId)
        const newGame = {
            id: "",
            room: RoomService.getRoomById(roomId),
            topic: "Anime", // generar random
            secretWord: "Death note", // generar random
            activePlayers: [...room.players.map((player : Player) => {return {...player, isReady: false}})],
            impostor: room.players[0].name, // generar random
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