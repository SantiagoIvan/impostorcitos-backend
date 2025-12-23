import { nextSeqMessage } from "../db";
import { CreateMessageDto } from "../lib";
import { Message } from "../domain"

export function toMessage(msgCreated: CreateMessageDto): Message {
    return {
        id: nextSeqMessage(),
        createdAt: msgCreated.createdAt,
        sender: msgCreated.sender,
        text: msgCreated.text,
        roomId: msgCreated.roomId,
        gameId: msgCreated.gameId
    }
}