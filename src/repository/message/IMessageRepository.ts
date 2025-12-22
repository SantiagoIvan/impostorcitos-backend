import { Message } from "../../lib";

export interface IMessageRepository {
    addMessage(msg: Message) : void
    getMessagesByRoom(roomId: string | undefined) : Message[] | undefined
    delete(roomId: string) : void

}