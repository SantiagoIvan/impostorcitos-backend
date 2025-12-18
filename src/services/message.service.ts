import { MessageRepository } from "../repository"
import { CreateMessageDto, Message } from "../lib"

export const MessageService = {
    addMessage: (msgDto: CreateMessageDto) : Message => {
        const newMsg = MessageRepository.addMessage(msgDto)
        return newMsg
    },
    cleanUpMessagesFromRoom: (roomId: string) => {
        MessageRepository.deleteFromRoom(roomId)
    }
}
