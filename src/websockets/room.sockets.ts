import { Socket } from "socket.io"
import { GameService, RoomService, SocketUsersService } from "../services"
import { RoomEvents, Room, CreateRoomDto, JoinRoomDto, Player, GameEvents, GENERAL_CHAT_CHANNEL } from "../shared"
import { Server } from "socket.io";
import { registerGameEvents } from "./game.sockets";

export const emitRoomList = (socket: { emit: (arg0: RoomEvents, arg1: Room[]) => void }) => {
  socket.emit(RoomEvents.LIST, RoomService.getRooms())
}

export const registerAllRoomEvents = (socket: Socket, io: Server) => {
    
  socket.on(RoomEvents.CREATE, (roomDto : CreateRoomDto) => {
    // Creamos el room y el mapa para almacenar los sockets de cada jugador
    
    const newRoom = RoomService.addRoom(roomDto)
    SocketUsersService.createNewMap(newRoom.id)
    io.emit(RoomEvents.CREATED, newRoom)
  })
  
  socket.on(RoomEvents.JOIN, (incomingPlayer : JoinRoomDto) => {
    /*
    - Si el usuario ya estaba en la sala, lo ignoro
    - Cuando un jugador se une a un Room, se une a determinado canal, donde se emitiran los eventos de mensajes del canal (nuevos ingresos/egresos, mensajes y relacionados al juego)
    - Se crea el registro en roomSocketUserMap, que es un log interno de todos los sockets de los clientes conectados en cada room, util
    para el juego.
    - Se notifica al resto de los usuarios de la aplicacion que alguien entro, asi actualizan su lista
    */
    if(RoomService.isPlayerInRoom(incomingPlayer)) return
    
    // Cuando un jugador se une a un room, se une al canal especifico y se va del general
    socket.leave(GENERAL_CHAT_CHANNEL)
    console.log(`New player ${incomingPlayer.username} trying to join ${incomingPlayer.roomId}`)
    const updatedRoom = RoomService.addPlayerToRoom(incomingPlayer)
    socket.join(incomingPlayer.roomId)

    SocketUsersService.addPlayerSocketToMap(incomingPlayer.username, updatedRoom.id, socket)

    io.emit(RoomEvents.JOINED, updatedRoom) 
    
  })

  socket.on(RoomEvents.LEAVE, (outcomingPlayer: JoinRoomDto) => {
    if(!RoomService.isPlayerInRoom(outcomingPlayer)) return
    
    // Cuando un jugador se va de un room, se sale del canal del room y entra al chat general
    console.log(`New player ${outcomingPlayer.username} is trying to LEAVE from ${outcomingPlayer.roomId}`)
    socket.join(GENERAL_CHAT_CHANNEL)
    const updatedRoom = RoomService.removePlayerfromRoom(outcomingPlayer)
    socket.leave(outcomingPlayer.roomId)

    // Lo elimino del mapa de sockets del room antes de avisarle a todos
    console.log(SocketUsersService.removePlayerSocketFromMap(outcomingPlayer.username, updatedRoom.id))
    io.emit(RoomEvents.USER_LEFT, updatedRoom)
  })

  socket.on(RoomEvents.READY, (userReady: JoinRoomDto) => {
    if(!RoomService.isPlayerInRoom(userReady)) return
    
    // Jugador activa el boton Ready y le avisa al resto de los jugadores
    console.log(`Player ${userReady.username} is ready for room ${userReady.roomId}`)
    const updatedRoom = RoomService.togglePlayerReadyInRoom(userReady)
    io.to(userReady.roomId).emit(RoomEvents.USER_READY, updatedRoom)
  })

  socket.on(RoomEvents.START_GAME, (roomId : string) => {
    // Crear nuevo Game object y eliminar room de la lista
    const newGame = GameService.createGame(roomId)
    const rooms = RoomService.removeRoom(roomId)
    
    // Agrego a cada jugador del game a la lista de sockets del game
    
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
      io.to(game.room.id).emit(GameEvents.ALL_READY, game)
    }
  })
}