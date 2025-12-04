import { Player } from "../shared"

export const PlayerService = {
    createPlayer: (name: string): Player => {
        return {
            name
        }
    }
}