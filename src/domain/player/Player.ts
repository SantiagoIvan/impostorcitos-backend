import { Socket } from 'socket.io';
import { Game } from '../game';
import { GameEvents } from '../../lib';
import { onDiscussionTurnEnd, onNextRound, onSubmitVote, onSubmitWord } from '../../websockets';
import { User } from '../user';
import { GENERAL_CHAT_CHANNEL } from '../..';

export class Player {
  private isAlive: boolean = true
  private isReady: boolean = false
  private skipPhase: boolean = false
  private hasPlayed: boolean = false
  private isConnected: boolean = true

  constructor(
    public readonly name: string,
    public readonly user: User,
  ){}
  get connected(){
    return this.isConnected
  }
  set connected(flag: boolean){
    this.isConnected = flag
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
  set setHasPlayed(flag : boolean){
    this.hasPlayed = flag
  }
  get socket() {
    return this.user.getSocket()
  }
  isPlayerAlive() : boolean {
    return this.isAlive === true
  }

  revive() {
    this.isAlive = true
  }

  canPlay() : boolean {
    return this.alive && !this.hasPlayed && !this.skipPhase && this.isConnected
  }
  markSkipPhase(){
    this.skipPhase = true
    this.user.updateLastActivity()
  }
  disconnect(game: Game) {
    this.isConnected = false
    this.cleanUpGameListeners(game)
    console.log("jugador Desconectado", this)
  }
  toogleIsReady(){
    this.isReady = !this.isReady
    this.user.updateLastActivity()
  }
  resetPlayerState() {
    this.hasPlayed = false
    this.skipPhase = false
    this.isReady = false
  }
  setIsReady(flag: boolean) {
    this.isReady = flag
    this.user.updateLastActivity()
  }
  die(){
    this.isAlive = false
    this.user.updateLastActivity()
  }
  joinChannel(channel: string){
    this.socket?.join(channel)
    this.user.updateLastActivity()
  }
  leaveChannel(channel: string){
    this.socket?.leave(channel)
    this.user.updateLastActivity()
  }
  markHasPlayed(){
    this.hasPlayed = true
    this.user.updateLastActivity()
  }
  cleanUpGameListeners(game: Game){
    this.user.setGameId = ""
    this.socket?.leave(game.id)
    this.socket?.leave(`${game.id}:dead`)
    this.socket?.leave(game.room.id)
    this.socket?.join(GENERAL_CHAT_CHANNEL)
    this.socket?.off(GameEvents.SUBMIT_WORD, onSubmitWord)
    this.socket?.off(GameEvents.DISCUSSION_TURN_END, onDiscussionTurnEnd)
    this.socket?.off(GameEvents.SUBMIT_VOTE, onSubmitVote)
    this.socket?.off(GameEvents.NEXT_ROUND, onNextRound)
  }
}