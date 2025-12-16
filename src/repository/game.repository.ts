import { gamesInProgress, nextSeqGame } from "../db";
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
    },
    getGames: () : Game[] => gamesInProgress,
    removeGame: (gameId: string) => {
        const gameIndex = gamesInProgress.findIndex((g : Game) => g.id === gameId)
        if(gameIndex !== -1){
            gamesInProgress.splice(gameIndex, 1)
        }
    }
}