import { RoomType } from "./roomType.enum"

export default interface Room {
    id: number
    name: string
    password?: string
    privacy: RoomType
    createdAt: string
}