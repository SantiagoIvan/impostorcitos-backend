import { Player, Game } from "../lib"
import { GameService } from "./game.service"

export const PlayerService = {
    createPlayer: (name: string): Player => {
        return {
            name,
            isReady: false,
            isAlive: true,
            skipPhase: false,
            hasPlayed: false
        }
    },
    setPlayerHasPlayed: (players: Player[], username: string) : Player | undefined => {
        const player = players.find((player: Player) => player.name === username)
        if(player){
            player.hasPlayed = true
        }
        return player
    },
    canPlay: (game: Game, playerName: string) : boolean => {
        return game.activePlayers.find((player: Player) => player.name === playerName && !player.hasPlayed && player.isAlive) ? true: false
    }
}