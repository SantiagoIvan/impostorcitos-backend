import { GameRepository } from "../repository";
import { Game, Player } from "../shared";
import { RoomService } from "./room.service";

export const GameService = {
    createGame: (roomId: string) : Game => {
        const room = RoomService.getRoomById(roomId)
        const newGame = {
            id: "",
            topic: "Anime", // generar random
            secretWord: "Death note", // generar random
            activePlayers: [...room.players.map((player: Player) => player.name)],
            impostor: room.players[0].name, // generar random
            rounds: [],
            impostorWonTheGame: false
        }
        GameRepository.createGame(newGame)
        return newGame
    }
}