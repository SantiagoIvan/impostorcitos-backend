import { Socket, Server } from "socket.io"
import { GameService, RoomService, SocketUsersService } from "../services"
import { RoomEvents, CreateRoomDto, JoinRoomDto, GameEvents, GENERAL_CHAT_CHANNEL, RoomDto } from "../lib"
import { registerGameEvents } from "./game.sockets";
import { Room, roomManager } from "../domain/room";
import { Player } from "../domain/player";
import { toRoomDTO } from "../mappers/room.mapper";

export const emitRoomList = (socket: { emit: (arg0: RoomEvents, arg1: RoomDto[]) => void }) => {
  const rooms = roomManager.getRooms().map((room: Room) => toRoomDTO(room))
  socket.emit(RoomEvents.LIST, rooms)
}

export const registerAllRoomEvents = (socket: Socket, io: Server) => {
  /* 
  *** RoomEvents.Create ***
  - Creamos el room y el mapa para almacenar los sockets de cada jugador
  */
  socket.on(RoomEvents.CREATE, (roomDto : CreateRoomDto) => {
    
    const newRoom = roomManager.createRoom(roomDto)
    SocketUsersService.createNewMap(newRoom.id)
    
    io.emit(RoomEvents.CREATED, toRoomDTO(newRoom))
  })
  


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
    if(roomManager.isPlayerInRoom(incomingPlayer.username, incomingPlayer.roomId)) return
    const player = new Player(incomingPlayer.username, socket)
    const updatedRoom = roomManager.addPlayerToRoom(player, incomingPlayer.roomId)

    socket.leave(GENERAL_CHAT_CHANNEL)
    socket.join(incomingPlayer.roomId)

    SocketUsersService.addPlayerSocketToMap(incomingPlayer.username, updatedRoom?.id || "", socket)

    io.emit(RoomEvents.JOINED, toRoomDTO(updatedRoom)) 
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

    SocketUsersService.removePlayerSocketFromMap(outcomingPlayer.username, updatedRoom.id)
    io.emit(RoomEvents.USER_LEFT, toRoomDTO(updatedRoom))
  })


  /*
  *** RoomEvents.Ready ***
  - Jugador activa el boton Ready y le avisa al resto de los jugadores
  */
  socket.on(RoomEvents.READY, (userReady: JoinRoomDto) => {
    if(!roomManager.isPlayerInRoom(userReady.username, userReady.roomId)) return
    
    const updatedRoom = roomManager.togglePlayerReadyInRoom(userReady.username, userReady.roomId)
    io.to(userReady.roomId).emit(RoomEvents.USER_READY, toRoomDTO(updatedRoom))
  })

  /*
  *** RoomEvents.Start_Game ***
  - Crear nuevo Game object y eliminar room de la lista
  - Agrego a cada jugador del game a la lista de sockets del game
  */
  socket.on(RoomEvents.START_GAME, (roomId : string) => {
    const newGame = GameService.createGame(roomId)
    const rooms = RoomService.cleanUpRoom(roomId)
    
    io.emit(RoomEvents.LIST, rooms)
    io.to(roomId).emit(RoomEvents.REDIRECT_TO_GAME, newGame)
  })

  socket.on(GameEvents.PLAYER_READY, ({username, gameId}) => {
    // Encontramos al jugador en activePlayers dentro del game y le ponemos el Ready
    const game = GameService.getGameById(gameId)
    const found = game.activePlayers.find((player: Player) => player.name === username)
    if(found){
      found.isReady = true
    }
    if(game.activePlayers.every((player: Player) => player.isReady)){
      // Suscribir cada socket a los eventos del juego con un registerGameEvents antes de emitir el All_Ready
      const socketPlayers = SocketUsersService.getSocketPlayersByRoom(game.room.id)
      socketPlayers.forEach((sock: Socket, user: string) => {
        registerGameEvents(sock, io)
      })
      GameService.startTurn(game)
      io.to(game.room.id).emit(GameEvents.START_ROUND, game)
    }
  })
}