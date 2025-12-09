import { gamesInProgress, nextSeqGame } from "../db/init";
import { Game } from "../shared";

export const GameRepository = {
    createGame: (game: Game): Game => {
        game.id = nextSeqGame().toString()
        gamesInProgress.push(game)
        return game
    }
}