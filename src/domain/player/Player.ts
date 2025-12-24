import { Socket } from 'socket.io';
import { Game } from '../game';
import { GameEvents } from '../../lib';
import { onDiscussionTurnEnd, onNextRound, onSubmitVote, onSubmitWord } from '../../websockets';

export class Player {
  private isAlive: boolean = true
  private isReady: boolean = false
  private skipPhase: boolean = false
  private hasPlayed: boolean = false

  constructor(
    public readonly name: string,
    public readonly socket: Socket,
  ){}
  
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
  set setHasPlayed(flag : boolean){
    this.hasPlayed = flag
  }
  isPlayerAlive() : boolean {
    return this.isAlive === true
  }
  canPlay() : boolean {
    return this.alive && !this.hasPlayed && !this.skipPhase
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
  setIsReady(flag: boolean) {
    this.isReady = flag
  }
  die(){
    this.isAlive = false
  }
  joinChannel(channel: string){
    this.socket.join(channel)
  }
  leaveChannel(channel: string){
    this.socket.leave(channel)
  }
  markHasPlayed(){
    this.hasPlayed = true
  }
  cleanUp(game: Game){
    this.socket.leave(game.id)
    this.socket.leave(`${game.id}:dead`)
    this.socket.leave(game.room.id)
    this.socket.off(GameEvents.SUBMIT_WORD, onSubmitWord)
    this.socket.off(GameEvents.DISCUSSION_TURN_END, onDiscussionTurnEnd)
    this.socket.off(GameEvents.SUBMIT_VOTE, onSubmitVote)
    this.socket.off(GameEvents.NEXT_ROUND, onNextRound)
  }
}