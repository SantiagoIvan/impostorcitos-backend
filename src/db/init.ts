import { Game, Message, Room, RoomType, SocketUser } from "../shared"

let seq_message = 0
let seq_room = 2
let seq_game = 0

export const socketUserMap : SocketUser[] = []

export function nextSeqRoom(){
    seq_room += 1
    return seq_room.toString()
}
export function nextSeqMessage(){
    seq_message += 1
    return seq_message.toString()
}

export function nextSeqGame(){
    seq_game += 1
    return seq_game.toString()
}



export const defaultMessages : Message[]= []

export const defaultRooms : Room[]= [
    {
        id: "1",
        admin: "santu",
        name: "Room Alpha",
        privacy: RoomType.PUBLIC,
        createdAt: new Date().toISOString(),
        discussionTime: 60,
        voteTime: 10,
        moveTime: 10,
        maxPlayers: 6,
        players: []
    },
    {
        id: "2",
        admin: "santu",
        name: "Room Gamma",
        privacy: RoomType.PRIVATE,
        password: "123",
        createdAt: new Date().toISOString(),
        discussionTime: 60,
        voteTime: 10,
        moveTime: 10,
        maxPlayers: 4,
        players: []
    }
]

export const gamesInProgress : Game[] = []