import { Game } from "./Game"
import { nextSeqGame } from "../../db"
import { RandomGeneratorService } from "../../services"
import { roomManager } from "../room"
import { Player } from "../player"
import { ConsoleLogger } from "../../logger"
import { shuffle, defaultTurn } from "../../lib"

const logger = new ConsoleLogger("[GAME_FACTORY]")

export const GameFactory = {
    createGame: (roomId: string) : Game => {
        const room = roomManager.getRoomById(roomId)
        if(!room) {
        logger.error(`Unable to create Game. Room not found`)
        throw new Error("[GAME_MANAGER] Unable to create Game. Room not found")
        } // mejorar y estandarizar los errores
        const playersList = [...room.players.values()]

        const randomTopic = RandomGeneratorService.generateRandomTopic()
        const randomWord = RandomGeneratorService.generateRandomWordFromTopic(randomTopic).toString()
        const impostor = RandomGeneratorService.generateRandomPlayer(playersList)
        const randomOrder = shuffle(playersList.map((player: Player) => player.name))
        
        return new Game(
            nextSeqGame(),
            new Date(),
            room,
            randomTopic,
            impostor,
            randomWord,
            randomOrder,
            defaultTurn
        );
    }
}