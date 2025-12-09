import {Round} from "@/shared";

export interface Game {
    topic: string
    secretWord: string
    activePlayers: string[]
    impostor: string
    rounds: Round[]
    currentRound: Round
    impostorWonTheGame: boolean
}