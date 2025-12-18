import { Socket } from 'socket.io';

export class Player {
  constructor(
    public readonly name: string,
    public readonly socket: Socket,
    private isAlive: boolean,
  ){}
  
  isPlayerAlive() : boolean {
    return this.isAlive === true
  }
}