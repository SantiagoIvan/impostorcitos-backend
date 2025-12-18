import { Socket } from "socket.io"
import { Game } from "../lib"

let seq_game = 0

export function nextSeqGame(){
    seq_game += 1
    return seq_game.toString()
}

export const gamesInProgress : Game[] = []

export const roomSocketUserMap : Map<string, Map<string, Socket>> = new Map<string, Map<string, Socket>>()
roomSocketUserMap.set("1", new Map<string, Socket>())
roomSocketUserMap.set("2", new Map<string, Socket>())
