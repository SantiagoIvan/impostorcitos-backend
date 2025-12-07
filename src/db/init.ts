import { Message, Room, RoomType } from "../shared"

let seq_message = 2
let seq_room = 6

export function nextSeqRoom(){
    seq_room += 1
    return seq_room.toString()
}
export function nextSeqMessage(){
    seq_message += 1
    return seq_message.toString()
} 

export const defaultMessages : Message[]= [
    {
        id: "1",
        text: "¡Hola! ¿Cómo estás?",
        sender: "other",
        createdAt: "10:30",
    },
    {
        id: "2",
        text: "Excelente, trabajando en el nuevo proyecto",
        sender: "random",
        createdAt: "10:32",
    },
]

export const defaultRooms : Room[]= [
    {
        id: "1",
        admin: {
            name: "santu",
            isReady: false
        },
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
        admin: {
            name: "santu2",
            isReady: false
        },
        name: "Room Beta",
        privacy: RoomType.PUBLIC,
        createdAt: new Date().toISOString(),
        discussionTime: 40,
        voteTime: 50,
        moveTime: 50,
        maxPlayers: 4,
        players: []
    },
    {
        id: "3",
        admin: {
            name: "santu3",
            isReady: false
        },
        name: "Room Gamma",
        privacy: RoomType.PRIVATE,
        password: "123",
        createdAt: new Date().toISOString(),
        discussionTime: 60,
        voteTime: 10,
        moveTime: 10,
        maxPlayers: 4,
        players: []
    },
    {
        id: "4",
        admin: {
            name: "santu4",
            isReady: false
        },
        name: "Room con tu hermana",
        privacy: RoomType.PUBLIC,
        createdAt: new Date().toISOString(),
        discussionTime: 60,
        voteTime: 10,
        moveTime: 10,
        maxPlayers: 6,
        players: []
    },
    {
        id: "5",
        admin: {
            name: "santu5",
            isReady: false
        },
        name: "Room con tu vieja",
        privacy: RoomType.PUBLIC,
        createdAt: new Date().toISOString(),
        discussionTime: 60,
        voteTime: 10,
        moveTime: 10,
        maxPlayers: 6,
        players: []
    },
    {
        id: "6",
        admin: {
            name: "santu6",
            isReady: false
        },
        name: "Room epsilon",
        privacy: RoomType.PRIVATE,
        password: "123",
        createdAt: new Date().toISOString(),
        discussionTime: 60,
        voteTime: 10,
        moveTime: 10,
        maxPlayers: 6,
        players: []
    },
]