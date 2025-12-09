import {Move, Vote} from "@/shared";

export interface Round {
    moves: Move[]
    votes: Vote[]
}