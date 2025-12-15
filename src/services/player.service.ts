import { Player } from "../shared"

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
    }
}