import { Server, Socket } from "socket.io";
import { GameEvents, JoinRoomDto } from "../shared";

let counter = 0

export const registerGameEvents = (socket: Socket, io: Server) => {
    socket.on(GameEvents.PLAYER_READY, (playerReady : JoinRoomDto) => {
        // contar players.isReady del room
        counter += 1
        if(counter === 3) {
            io.to(playerReady.roomId).emit(GameEvents.ALL_READY, playerReady.roomId)
        }
    })
}