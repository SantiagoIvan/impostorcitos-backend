import { CreateMessageDto, Message } from "../../lib";
import { ConsoleLogger, ILogger } from "../../logger";
import { toMessage } from "../../mappers/message.mapper";
import { IMessageRepository, InMemoryMessageRepository } from "../../repository";

class MessageManager{
    constructor(
        private messageRepository: IMessageRepository,
        private logger: ILogger
    ){}

    addMessage(newMessage: CreateMessageDto): Message {
        const msg = toMessage(newMessage)
        this.messageRepository.addMessage(msg)
        this.logger.info(`Message has been saved successfully. Messages length is `, this.getMessagesByRoom(newMessage.roomId).length)
        return msg
    }
    deleteRoomMessages(roomId: string){
        this.messageRepository.delete(roomId)
    }
    getMessagesByRoom(roomId: string | undefined): Message[] {
        return this.messageRepository.getMessagesByRoom(roomId) || []
    }
}

export const messageManager = new MessageManager(
    new InMemoryMessageRepository(),
    new ConsoleLogger(MessageManager.name)
)