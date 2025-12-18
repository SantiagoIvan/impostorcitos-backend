import { Room, RoomType } from "../lib"


let seq_room = 2

export function nextSeqRoom(){
    seq_room += 1
    return seq_room.toString()
}

export const defaultRooms : Room[]= [
    {
        id: "1",
        admin: "santu",
        name: "Room Alpha",
        privacy: RoomType.PUBLIC,
        createdAt: new Date().toISOString(),
        discussionTime: 20,
        voteTime: 15,
        moveTime: 15,
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
        discussionTime: 20,
        voteTime: 15,
        moveTime: 15,
        maxPlayers: 4,
        players: []
    }
]