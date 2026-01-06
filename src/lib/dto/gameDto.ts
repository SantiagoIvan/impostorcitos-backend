import { Turn } from "../types";
import { GamePhase, Vote, Move } from "../../domain";
import { RoomDto } from "./roomDto";

export interface GameDto {
    id: string
    room: RoomDto
    topic: string
    moves: Move[]
    votes: Vote[]
    impostor: boolean
    impostorWonTheGame: boolean
    currentTurn: Turn
    nextTurnIndexPlayer: number
    currentPhase: GamePhase
    currentRound: number
    secretWord?: string
    aborted?: boolean
}
