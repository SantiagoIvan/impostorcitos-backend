import { Socket } from 'socket.io';

export class Player {
  private isAlive: boolean = true
  private isReady: boolean = false
  private skipPhase: boolean = false
  private hasPlayed: boolean = false

  constructor(
    public readonly name: string,
    public readonly socket?: Socket,
  ){}
  
  isPlayerAlive() : boolean {
    return this.isAlive === true
  }
  canPlay() : boolean {
    return this.isAlive && !this.hasPlayed && !this.skipPhase
  }
  markHasPlayed(){
    this.hasPlayed = true
  }
  markSkipPhase(){
    this.skipPhase = true
  }
  toogleIsReady(){
    this.isReady = !this.isReady
  }
  resetPlayerTurn() {
    this.hasPlayed = false
    this.skipPhase = false
    this.isReady = false
  }
  get alive(): boolean {
    return this.isAlive
  }

  get ready(): boolean {
    return this.isReady
  }

  get skippedPhase(): boolean {
    return this.skipPhase
  }

  get played(): boolean {
    return this.hasPlayed
  }
}