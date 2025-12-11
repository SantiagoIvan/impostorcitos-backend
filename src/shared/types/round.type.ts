import {Move, Vote} from "../../shared";

export interface Round {
    id: number
    moves: Move[]
    votes: Vote[]
}