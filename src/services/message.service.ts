import { nextSeqMessage } from "../db/init"
import { MessageRepository } from "../repository"
import { CreateMessageDto, Message } from "../shared"

export const MessageService = {
    addMessage: (msgDto: CreateMessageDto) : Message => {
        const newMsg = {
            id: nextSeqMessage(),
            text: msgDto.text,
            sender: msgDto.sender,
            createdAt: new Date().toISOString()
        }
        MessageRepository.addMessage(newMsg)
        return newMsg
    }
}
