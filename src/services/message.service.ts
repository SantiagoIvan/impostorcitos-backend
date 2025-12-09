import { nextSeqMessage } from "../db/init"
import { MessageRepository } from "../repository"
import { CreateMessageDto, Message } from "../shared"

export const MessageService = {
    addMessage: (msgDto: CreateMessageDto) : Message => {
        const newMsg = MessageRepository.addMessage(msgDto)
        return newMsg
    }
}
