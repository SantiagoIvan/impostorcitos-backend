import { nextSeqMessage } from "../db/init"
import { MessageRepository } from "../repository"
import { CreateMessageDto, Message } from "../shared"

export const MessageService = {
    addMessage: (msgDto: CreateMessageDto) : Message => {
        const newMsg = {
            id: nextSeqMessage(),
            ...msgDto,
            createdAt: new Date().toISOString()
        }
        MessageRepository.addMessage(newMsg)
        return newMsg
    }
}
