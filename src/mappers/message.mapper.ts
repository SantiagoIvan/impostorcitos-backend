import { nextSeqMessage } from "../db";
import { CreateMessageDto, Message } from "../lib";

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