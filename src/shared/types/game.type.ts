import { Move } from "./move.type";
import { GamePhase } from "./gamePhase.enum";
import { Player } from "./player.type";
import { Room } from "./room.type";
import { Vote } from "./vote.type";

export interface Game {
    id: string
    room: Room
    topic: string
    secretWord: string
    activePlayers: Player[]
    impostor: string
    moves: Move[]
    votes: Vote[]
    impostorWonTheGame: boolean
    nextTurnIndexPlayer: number
    orderToPlay: string[]
    currentPhase: GamePhase
    currentRound: number
}