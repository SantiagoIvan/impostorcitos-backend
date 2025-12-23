import { RoomEvents, GameEvents } from "../lib";
import { toGameDTO } from "../mappers";
import { Game, Player } from "../domain";
import { ConsoleLogger, ILogger } from "../logger";


export class GameService {
    constructor(
        private readonly logger: ILogger
      ){}
    /*
    setImpostor(game: Game, impostor: string) {
        game.impostor = impostor
    }
    setImpostorWonTheGame(game: Game, flag: boolean) {
        game.impostorWonTheGame = flag
    }
    cleanUpGame(game: Game) {
        console.log("[GAME_SERVICE] Limpiando roomUserSocketMap, mensajes del room, room, game y listeners del game")
        // faltan los listeners para cada socket
        MessageService.cleanUpMessagesFromRoom(game.room.id)
        SocketUsersService.removeEntryMap(game.room.id)
        RoomService.cleanUpRoom(game.room.id)
        GameService.removeGame(game.id)
    }
    */
    updateGameStateToClient(game: Game, event: RoomEvents | GameEvents) {
        game.getPlayersAsList().forEach((player: Player) => {
            const gameDto = toGameDTO(game, player.name)
            this.logger.info(`Game has been sent to client ${player.name}`, gameDto)
            player.socket.emit(event, gameDto)
    
        })
    }
}

export const getNewGameService = () => new GameService(new ConsoleLogger(GameService.name))