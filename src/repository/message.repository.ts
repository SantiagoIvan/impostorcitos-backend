import { defaultMessages, nextSeqMessage, setMessages } from "../db"
import { CreateMessageDto, Message } from "../shared"

export const MessageRepository = {
    getMessages: () : Message[]=> defaultMessages,
    addMessage: (msgDto: CreateMessageDto) : Message => {
        const newMsg = {
            roomId: msgDto.roomId,
            id: nextSeqMessage(),
            text: msgDto.text,
            sender: msgDto.sender,
            createdAt: new Date().toISOString()
        }
        defaultMessages.push(newMsg)
        return newMsg
    },
    deleteFromRoom: (roomId: string) => {
        setMessages(defaultMessages.filter((msg : Message) => msg.roomId !== roomId))
    }
}