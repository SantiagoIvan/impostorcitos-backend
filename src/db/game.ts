import { Socket } from "socket.io"
import { Game } from "../shared"

let seq_game = 0

export function nextSeqGame(){
    seq_game += 1
    return seq_game.toString()
}

export const gamesInProgress : Game[] = []

export const gameSocketUserMap : Map<string, Map<string, Socket>> = new Map<string, Map<string, Socket>>() 
