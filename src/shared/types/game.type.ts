import { Move } from "./move.type";
import { PhaseGame } from "./phaseGame.enum";
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
    currentPhase: PhaseGame
    currentRound: number
}