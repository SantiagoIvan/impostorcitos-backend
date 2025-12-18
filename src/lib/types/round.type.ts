import {Move, Vote} from "..";

export interface Round {
    id: number
    moves: Move[]
    votes: Vote[]
}