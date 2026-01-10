import { CreateMessageDto, MessageEvents } from "../../lib"
import { ConsoleLogger } from "../../logger"
import { GENERAL_CHAT_CHANNEL, io, MAX_MESSAGE_LENGTH } from "../.."
import { gameManager, messageManager, UserNotFoundError } from "../../domain"
import { userManager } from "../../domain/user/UserManager"

const logger = new ConsoleLogger("MESSAGE_LISTENER")

export function onMessageCreate(msgDto : CreateMessageDto){
  try{
    logger.info(`New message from ${msgDto.sender} to ${msgDto.roomId? "Room " + msgDto.roomId : msgDto.gameId? "Game "+msgDto.gameId : "General"}`)
    msgDto.text = msgDto.text.substring(0, MAX_MESSAGE_LENGTH)
    const newMessage = messageManager.addMessage(msgDto)
    const user = userManager.getUserByUsername(msgDto.sender)
    if(!user){
      throw new UserNotFoundError(msgDto.sender)
    }
    user.updateLastActivity()
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