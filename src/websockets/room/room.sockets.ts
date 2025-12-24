import { Socket, Server } from "socket.io"
import { gameService, roomService } from "../../services"
import { RoomEvents, CreateRoomDto, JoinRoomDto, GameEvents, RoomDto, GameDto } from "../../lib"
import { registerGameEvents } from "../game";
import { toRoomDTO, toRoomDTOArray, toGameDTO } from "../../mappers";
import { Game, gameManager, roomManager, Player } from "../../domain";
import { GENERAL_CHAT_CHANNEL } from "../..";
import { Console } from "console";
import { ConsoleLogger } from "../../logger";
import { onPlayerReady, onRoomCreate, onRoomReady, onStartGame } from "./room.listeners";

export const emitRoomList = (socket: { emit: (arg0: RoomEvents, arg1: RoomDto[]) => void }) => {
  const rooms = toRoomDTOArray(roomManager.getRooms())
  socket.emit(RoomEvents.LIST, rooms)
}

const logger = new ConsoleLogger("ROOM_SERVICE")

export const registerAllRoomEvents = (socket: Socket, io: Server) => {
  /* 
  *** RoomEvents.Create ***
  - Creamos el room y el mapa para almacenar los sockets de cada jugador
  */
  socket.on(RoomEvents.CREATE, onRoomCreate)
  


  /* 
  *** RoomEvents.Join ***
  - Si el usuario ya estaba en la sala, no emito ningun evento.
  - Cuando un jugador se une a un Room, se une a determinado canal, donde se emitiran los eventos de mensajes del canal (nuevos ingresos/egresos, mensajes y
  eventos relacionados al juego)
  - Se crea el registro en roomSocketUserMap, que es un mapa interno de todos los sockets de los clientes conectados en cada room, util
  para el juego.
  - Se notifica al resto de los usuarios de la aplicacion que alguien entro, asi actualizan su lista
  - Cuando un jugador se une a un room, se une al canal especifico y se va del general
  */
  socket.on(RoomEvents.JOIN, (incomingPlayer : JoinRoomDto) => {
    try{
      if(roomManager.isPlayerInRoom(incomingPlayer.username, incomingPlayer.roomId)) return
      const player = new Player(incomingPlayer.username, socket)
      const updatedRoom = roomManager.addPlayerToRoom(player, incomingPlayer.roomId)
  
      socket.leave(GENERAL_CHAT_CHANNEL)
      socket.join(incomingPlayer.roomId)
  
      io.emit(RoomEvents.JOINED, toRoomDTO(updatedRoom))
    }catch(error: any){
      logger.error(error.message)
    }
  })



  /* 
  *** RoomEvents.Leave *** 
  - Cuando un jugador se va de un room, se sale del canal del room y entra al chat general
  - Lo elimino del mapa de sockets del room antes de avisarle a todos
  */
  socket.on(RoomEvents.LEAVE, (outcomingPlayer: JoinRoomDto) => {
    if(!roomManager.isPlayerInRoom(outcomingPlayer.username, outcomingPlayer.roomId)) return
    
    const updatedRoom = roomManager.removePlayerfromRoom(outcomingPlayer.username, outcomingPlayer.roomId)
    socket.join(GENERAL_CHAT_CHANNEL)
    socket.leave(outcomingPlayer.roomId)

    io.emit(RoomEvents.USER_LEFT, toRoomDTO(updatedRoom))
  })


  /*
  *** RoomEvents.Ready ***
  - Jugador activa el boton Ready y le avisa al resto de los jugadores
  */
  socket.on(RoomEvents.READY, onRoomReady)



  /*
  *** RoomEvents.Start_Game ***
  - Crear nuevo Game object y eliminar room de la lista de rooms
  - A todos los envio el status del game con la palabra secreta, menos al impostor. Al impostor le mando ese campo en null
  - Emito evento Redirect to game para redirigirlos a la pantalla de la partida.
  */
  socket.on(RoomEvents.START_GAME, onStartGame)


  /*
  *** RoomEvents.Player_Ready ***
  - Ponemos en Ready a cada jugador de la partida.
  - Si estan todos listos, empezamos la ronda, y suscribo a cada socket de cada jugador a los eventos del game
  - Emito evento para comenzar a jugar
  */
  socket.on(GameEvents.PLAYER_READY, onPlayerReady)
}