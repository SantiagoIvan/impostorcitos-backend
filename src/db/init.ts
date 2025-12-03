import { RoomType } from "../types/roomType.enum"

export const defaultMessages = [
    {
        id: 1,
        text: "¡Hola! ¿Cómo estás?",
        sender: "other",
        time: "10:30",
    },
    {
        id: 2,
        text: "Excelente, trabajando en el nuevo proyecto",
        sender: "random",
        time: "10:32",
    },
]

export const defaultRooms = [
    {
        id: 1,
        name: "Room Alpha",
        privacy: RoomType.PUBLIC,
        createdAt: "Hace 2 horas",
    },
    {
        id: 2,
        name: "Room Beta",
        privacy: RoomType.PUBLIC,
        createdAt: "Hace 5 horas",
    },
    {
        id: 3,
        name: "Room Gamma",
        password: "123",
        privacy: RoomType.PRIVATE,
        createdAt: "Hace 1 día",
    },
    {
        id: 4,
        name: "Room Delta",
        privacy: RoomType.PUBLIC,
        createdAt: "Hace 3 días",
    },
    {
        id: 5,
        name: "Room Epsilon",
        privacy: RoomType.PUBLIC,
        createdAt: "Hace 6 horas",
    },
    {
        id: 6,
        name: "Room Zeta",
        password: "asd",
        privacy: RoomType.PRIVATE,
        createdAt: "Hace 2 días",
    },
]