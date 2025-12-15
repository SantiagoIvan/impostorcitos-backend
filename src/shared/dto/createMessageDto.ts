export interface CreateMessageDto {
    roomId?: string
    gameId?: string
    text: string
    sender: string
    createdAt: string
}