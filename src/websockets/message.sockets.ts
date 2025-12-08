import { Socket } from "socket.io"
import { MessageService } from "../services"
import { MessageEvents, CreateMessageDto } from "../shared"
import { Server } from "socket.io";
import { GENERAL_CHAT_CHANNEL } from "../shared/constants";

export const registerMessageEvents = (socket: Socket, io: Server) => {

  socket.join(GENERAL_CHAT_CHANNEL)
  
  socket.on(MessageEvents.CREATE, (msgDto : CreateMessageDto) => {
    console.log("new message to ", msgDto)
    const newMessage = MessageService.addMessage(msgDto)
    if(!msgDto.roomId){
      io.to(GENERAL_CHAT_CHANNEL).emit(MessageEvents.CREATED, newMessage)
    }else{
      io.to(msgDto.roomId).emit(MessageEvents.CREATED, newMessage) // lo reciben solo los sockets que estan escuchando en el canal del roomId
    }
  })
  // podria agregar la posibilidad de borrar mensajes tipo wpp, y aca emitir el msj de deleted y que se les borre a todos
}