import { Game, Message, Room, RoomType, SocketUser } from "../shared"

let seq_message = 0




export function nextSeqMessage(){
    seq_message += 1
    return seq_message.toString()
}





export const defaultMessages : Message[]= []


