import { defaultMessages, nextSeqMessage } from "../db/init"
import { CreateMessageDto, Message } from "../shared"

export const MessageRepository = {
    getMessages: () : Message[]=> defaultMessages,
    addMessage: (msgDto: CreateMessageDto) : Message => {
        const newMsg = {
            id: nextSeqMessage(),
            text: msgDto.text,
            sender: msgDto.sender,
            createdAt: new Date().toISOString()
        }
        defaultMessages.push(newMsg)
        return newMsg
    }
}