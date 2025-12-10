import { gamesInProgress, nextSeqGame } from "../db/init";
import { Game } from "../shared";
import { defaultGame } from "../shared/defaultValues/game";

export const GameRepository = {
    createGame: (game: Game): Game => {
        game.id = nextSeqGame().toString()
        gamesInProgress.push(game)
        return game
    },
    getGameById: (id: string): Game => {
        return gamesInProgress.find((game: Game) => game.id === id) || defaultGame 
    }
}