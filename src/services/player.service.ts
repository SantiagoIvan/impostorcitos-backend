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
    }
}