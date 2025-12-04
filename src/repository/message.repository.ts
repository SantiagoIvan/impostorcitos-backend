import { defaultMessages } from "../db/init"
import { Message } from "../shared"

export const MessageRepository = {
    getMessages: () : Message[]=> defaultMessages,
    addMessage: (msg: Message) : Message => {
        defaultMessages.push(msg)
        return msg
    }
}