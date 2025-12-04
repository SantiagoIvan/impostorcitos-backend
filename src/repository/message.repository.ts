import { defaultMessages } from "../db/init"
import { Message } from "../shared"

export const MessageRepository = {
    getMessages: () : Message[]=> defaultMessages
}