import {Round} from "./round.type";

export interface Game {
    id: string
    topic: string
    secretWord: string
    activePlayers: string[]
    impostor: string
    rounds: Round[]
    impostorWonTheGame: boolean
}