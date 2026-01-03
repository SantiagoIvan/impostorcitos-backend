import { Socket } from "socket.io";

export class User{
    constructor(
        public readonly id: string,
        public readonly username: string,
        private socket: Socket
    ){}

    getUsername(){
        return this.username
    }
    getSocket(){
        return this.socket
    }
}