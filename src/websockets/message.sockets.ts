import { Socket, Server} from "socket.io"
import { MessageEvents, CreateMessageDto } from "../lib"
import { gameManager, messageManager } from "../domain";
import { GENERAL_CHAT_CHANNEL } from "..";

export const registerMessageEvents = (socket: Socket, io: Server) => {
  
  socket.join(GENERAL_CHAT_CHANNEL)
  
  socket.on(MessageEvents.CREATE, (msgDto : CreateMessageDto) => {
    const newMessage = messageManager.addMessage(msgDto)
    if(!msgDto.roomId){ // Estas en lobby, chat general
      io.to(GENERAL_CHAT_CHANNEL).emit(MessageEvents.CREATED, newMessage)
      return
    }
    if(!msgDto.gameId){ // Estas en una sala sin haber empezado el juego
      io.to(msgDto.roomId).emit(MessageEvents.CREATED, newMessage) // lo reciben solo los sockets que estan escuchando en el canal del roomId
      return
    }

    // Si esta muerto, manda el mensaje al canal de los muertos asi solo los muertos te leen, pero estan en modo obs Asi que reciben todos los mensajes de todos
    const game = gameManager.getGameById(msgDto.gameId)
    const player = game?.getPlayerByName(msgDto.sender)
    if(player && !player.alive){
      io.to(`${msgDto.roomId}:dead`).emit(MessageEvents.CREATED, newMessage)
      return
    }
    if(player && player.alive){
      io.to(`${msgDto.roomId}`).emit(MessageEvents.CREATED, newMessage)
    }
    
  })
  // podria agregar la posibilidad de borrar mensajes tipo wpp, y aca emitir el msj de deleted y que se les borre a todos
}