import { Player } from "./player.type";
import { Room } from "./room.type";
import {Round} from "./round.type";

export interface Game {
    id: string
    room: Room
    topic: string
    secretWord: string
    activePlayers: Player[]
    impostor: string
    rounds: Round[]
    impostorWonTheGame: boolean
    nextTurnIndexPlayer: number
}