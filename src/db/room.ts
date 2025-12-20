import { Room } from "../lib"


let seq_room = 0

export function nextSeqRoom(){
    seq_room += 1
    return seq_room.toString()
}

export const defaultRooms : Room[]= []