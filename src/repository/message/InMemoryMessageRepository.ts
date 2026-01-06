import { Message } from "../../domain";
import { IMessageRepository } from "./IMessageRepository";
import { GENERAL_CHAT_CHANNEL } from "../..";

export class InMemoryMessageRepository
  implements IMessageRepository {
    private channelMessages : Map<string, Message[]> = new Map<string, Message[]>()

    addMessage(newMessage: Message): void {
      const channel = newMessage.roomId || GENERAL_CHAT_CHANNEL
      const msgs = this.channelMessages.get(channel)
      if(msgs){
        msgs.push(newMessage)
        this.channelMessages.set(channel, msgs)
        return
      }else{
        // es el primer mensaje, asi que tengo que crear la clave y crear el array con el primer elemento que sera el nuevo mensaje
        this.channelMessages.set(channel, [newMessage])
      }
    }
    getMessagesByRoom(roomId: string | undefined) : Message[] | undefined {
      return this.channelMessages.get(roomId || GENERAL_CHAT_CHANNEL)
    }
    delete(roomId: string): void {
      this.channelMessages.delete(roomId)
    }
    getAll(): Map<string, Message[]> {
      return this.channelMessages
    }
}
