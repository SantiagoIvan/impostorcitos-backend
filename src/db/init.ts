import { RoomType } from "../shared"

let seq_message = 2
let seq_room = 6

export function nextSeqRoom(){
    seq_room += 1
    return seq_room
}
export function nextSeqMessage(){
    seq_message += 1
    return seq_message
} 

export const defaultMessages = [
    {
        id: 1,
        text: "¡Hola! ¿Cómo estás?",
        sender: "other",
        createdAt: "10:30",
    },
    {
        id: 2,
        text: "Excelente, trabajando en el nuevo proyecto",
        sender: "random",
        createdAt: "10:32",
    },
]

export const defaultRooms = [
    {
        id: 1,
        admin: {
            name: "santu"
        },
        name: "Room Alpha",
        privacy: RoomType.PUBLIC,
        createdAt: "Hace 2 horas",
        discussionTime: 60,
        voteTime: 10,
        moveTime: 10,
        maxPlayers: 6,
        players: [
            {
                name: "santu"
            }
        ]
    },
    {
        id: 2,
        admin: {
            name: "santu2"
        },
        name: "Room Beta",
        privacy: RoomType.PUBLIC,
        createdAt: "Hace 1 horas",
        discussionTime: 40,
        voteTime: 50,
        moveTime: 50,
        maxPlayers: 4,
        players: [
            {
                name: "santu2"
            }
        ]
    },
    {
        id: 3,
        admin: {
            name: "santu3"
        },
        name: "Room Gamma",
        privacy: RoomType.PRIVATE,
        password: "123",
        createdAt: "Hace 2 horas",
        discussionTime: 60,
        voteTime: 10,
        moveTime: 10,
        maxPlayers: 4,
        players: [
            {
                name: "santu3"
            }
        ]
    },
    {
        id: 4,
        admin: {
            name: "santu4"
        },
        name: "Room con tu hermana",
        privacy: RoomType.PUBLIC,
        createdAt: "Hace 5 horas",
        discussionTime: 60,
        voteTime: 10,
        moveTime: 10,
        maxPlayers: 6,
        players: [
            {
                name: "santu4"
            }
        ]
    },
    {
        id: 5,
        admin: {
            name: "santu5"
        },
        name: "Room con tu vieja",
        privacy: RoomType.PUBLIC,
        createdAt: "Hace 20 horas",
        discussionTime: 60,
        voteTime: 10,
        moveTime: 10,
        maxPlayers: 6,
        players: [
            {
                name: "santu5"
            }
        ]
    },
    {
        id: 6,
        admin: {
            name: "santu6"
        },
        name: "Room epsilon",
        privacy: RoomType.PRIVATE,
        password: "123",
        createdAt: "Hace 2 horas",
        discussionTime: 60,
        voteTime: 10,
        moveTime: 10,
        maxPlayers: 6,
        players: [
            {
                name: "santu6"
            }
        ]
    },
]