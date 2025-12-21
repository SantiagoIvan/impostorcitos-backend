import { Move, Room, Vote, Turn, GamePhase } from "../types";
import { RoomDto } from "./roomDto";

export interface GameDto {
    id: string
    room: RoomDto
    topic: string
    moves: Move[]
    votes: Vote[]
    impostorWonTheGame: boolean
    currentTurn: Turn
    nextTurnIndexPlayer: number
    currentPhase: GamePhase
    currentRound: number
    secretWord?: string
}
