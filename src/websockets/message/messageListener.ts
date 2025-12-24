import { CreateMessageDto, MessageEvents } from "../../lib"
import { ConsoleLogger } from "../../logger"
import { GENERAL_CHAT_CHANNEL, io } from "../.."
import { gameManager, messageManager } from "../../domain"

const logger = new ConsoleLogger("MESSAGE_LISTENER")

export function onMessageCreate(msgDto : CreateMessageDto){
  try{
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
  }catch(error: any){
    logger.error(error.message)
  }
    
}