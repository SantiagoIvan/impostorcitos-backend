import { Socket } from "socket.io"
import { roomSocketUserMap } from "../db"
import { defaultUserSocketMap } from "../shared"

export const SocketUsersService = {
    getSocketPlayersByRoom: (roomId: string): Map<string, Socket> => roomSocketUserMap.get(roomId) || defaultUserSocketMap,
    createNewMap: (roomId: string): Map<string, Map<string, Socket>> => {
        roomSocketUserMap.set(roomId, new Map<string, Socket>())
        return roomSocketUserMap
    },
    addPlayerSocketToMap: (username: string, roomId: string, socket: Socket): Map<string, Socket> => {
        roomSocketUserMap.get(roomId)?.set(username, socket)
        return roomSocketUserMap.get(roomId) || defaultUserSocketMap
    },
    removePlayerSocketFromMap: (username: string, roomId: string): Map<string, Socket> => {
        roomSocketUserMap.get(roomId)?.delete(username)
        return roomSocketUserMap.get(roomId) || defaultUserSocketMap
    },
    getSocketPlayer: (roomId: string, playerName: string): Socket | undefined=> roomSocketUserMap.get(roomId)?.get(playerName) || defaultUserSocketMap.get(playerName)

}