import { Socket } from "socket.io"
import { MessageService } from "../services"
import { MessageEvents, CreateMessageDto } from "../shared"
import { Server } from "socket.io";

export const registerAllMessageEvents = (socket: Socket, io: Server) => {
    socket.on(MessageEvents.CREATE, (msgDto : CreateMessageDto) => {
      const newMessage = MessageService.addMessage(msgDto)
      io.emit(MessageEvents.CREATED, newMessage)
  })
}