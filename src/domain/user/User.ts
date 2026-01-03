import { Socket } from "socket.io";

export class User{
    constructor(
        public readonly id: string,
        public readonly username: string,
        private socket?: Socket,
        private roomId?: string,
        private gameId?: string
    ){}

    getUsername(){
        return this.username
    }
    getSocket(){
        return this.socket
    }
    getRoomId(){
        return this.roomId
    }
    getGameId(){
        return this.gameId
    }
    set setSocket(sk: Socket){
        this.socket = sk
    }
    set setRoomId(id: string){
        this.roomId = id
    }
    set setGameId(id: string){
        this.gameId = id
    }
}