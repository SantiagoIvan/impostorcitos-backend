import { Socket, Server} from "socket.io"
import { MessageEvents, CreateMessageDto } from "../../lib"
import { gameManager, messageManager } from "../../domain";
import { GENERAL_CHAT_CHANNEL } from "../..";
import { onMessageCreate } from "./messageListener";

export const registerMessageEvents = (socket: Socket, io: Server) => {
  
  socket.join(GENERAL_CHAT_CHANNEL)
  
  socket.on(MessageEvents.CREATE, onMessageCreate)
  // podria agregar la posibilidad de borrar mensajes tipo wpp, y aca emitir el msj de deleted y que se les borre a todos
}