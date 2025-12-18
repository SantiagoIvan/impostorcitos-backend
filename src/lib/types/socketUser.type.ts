import { Socket } from "socket.io"

export interface SocketUser {
    socket: Socket
    username: string
}