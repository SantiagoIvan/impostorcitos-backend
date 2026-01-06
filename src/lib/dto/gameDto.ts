import { Turn } from "../types";
import { GamePhase, Move } from "../../domain";
import { RoomDto } from "./roomDto";
import { VoteDto } from "./voteDto";

export interface GameDto {
    id: string
    room: RoomDto
    topic: string
    moves: Move[]
    votes: VoteDto[]
    impostor: boolean
    impostorWonTheGame: boolean
    currentTurn: Turn
    nextTurnIndexPlayer: number
    currentPhase: GamePhase
    currentRound: number
    secretWord?: string
    aborted?: boolean
}
