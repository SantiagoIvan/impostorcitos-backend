import { Move } from "./move.type";
import { Player } from "./player.type";
import { Room } from "./room.type";
import {Round} from "./round.type";
import { Vote } from "./vote.type";

export interface Game {
    id: string
    room: Room
    topic: string
    secretWord: string
    activePlayers: Player[]
    impostor: string
    moves: Move[],
    votes: Vote[],
    impostorWonTheGame: boolean
    nextTurnIndexPlayer: number
}