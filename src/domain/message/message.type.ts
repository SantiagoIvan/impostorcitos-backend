export interface Message {
    roomId?: string
    gameId?: string
    id: string
    text: string
    sender: string
    createdAt: string
}