import { Socket } from "socket.io"
import { MessageService } from "../services"
import { MessageEvents, CreateMessageDto } from "../shared"
import { Server } from "socket.io";

export const registerMessageEvents = (socket: Socket, io: Server) => {

  socket.on(MessageEvents.CREATE, (msgDto : CreateMessageDto) => {
    const newMessage = MessageService.addMessage(msgDto)
    if(!msgDto.roomId){
      io.emit(MessageEvents.CREATED, newMessage) // lo reciben todos
    }else{
      io.to(msgDto.roomId).emit(MessageEvents.CREATED, newMessage) // lo reciben solo los sockets que estan escuchando en el canal del roomId
    }
  })
  // podria agregar la posibilidad de borrar mensajes tipo wpp, y aca emitir el msj de deleted y que se les borre a todos
}