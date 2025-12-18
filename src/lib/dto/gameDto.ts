import { Move, Room, Player, Vote, Turn, GamePhase } from "../types";

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
    currentTurn: Turn
    nextTurnIndexPlayer: number
    orderToPlay: string[]
    currentPhase: GamePhase
    currentRound: number
}