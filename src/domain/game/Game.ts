import { Player, PlayerNotFoundError, Room, RoundResult } from '../';
import { Turn, getPlayersWithMostVotes } from '../../lib';
import { transformSecondsToMS } from '../../lib';
import { GamePhase, Move, Vote } from "../../domain"

export class Game {
  public readonly createdAt: Date = new Date();
  public readonly moves: Move[] = []
  public readonly votes: Vote[] = []
  public readonly roundResults : RoundResult[] = []
  private nextTurnIndexPlayer: number = 0
  private impostorWonTheGame: boolean = false
  private currentRound: number = 1
  private currentPhase: GamePhase = GamePhase.PLAY

  constructor(
    public readonly id: string,
    private lastActivityAt: Date,
    public readonly room: Room,
    public readonly topic: string,
    public readonly impostor: string,
    public readonly secretWord: string,
    public readonly orderToPlay: string[],
    private currentTurn: Turn,
  ) {}
  get impostorWon() {
    return this.impostorWonTheGame
  }
  get getCurrentTurn() {
    return this.currentTurn
  }
  get lastActivity(): Date {
    return this.lastActivityAt
  }
  get getNextTurnIndexPlayer() {
    return this.nextTurnIndexPlayer
  }
  get getCurrentPhase() {
    return this.currentPhase
  }
  get getCurrentRound() {
    return this.currentRound
  }
  set setTurn(newTurn : Turn){
    this.currentTurn = newTurn
  }
  set setCurrentPhase(newPhase: GamePhase){
    this.currentPhase = newPhase
  }
  set setCurrentRound(num: number){
    this.currentRound = num
  }

  resetRoundTurnState(): void {
    this.room.players.forEach((p: Player) => {
      p.resetPlayerTurn()
    })
    this.nextTurnIndexPlayer = 0
    this.updateLastActivity()
  }
  allReady(): boolean{
    return this.room.allReady()
  }
  allPlayed(): boolean{
    return this.room.allPlayed()
  }
  startTurn(){
    this.currentTurn = {
        player: this.orderToPlay[this.nextTurnIndexPlayer],
        duration: 
            this.currentPhase === GamePhase.PLAY? transformSecondsToMS(this.room.moveTime): 
            this.getCurrentPhase === GamePhase.DISCUSSION? 
              transformSecondsToMS(this.room.discussionTime): 
              transformSecondsToMS(this.room.voteTime),
        startedAt: Date.now()
    }
    this.updateLastActivity()
  }
  getPlayersAsList(): Player[] {
    return [...this.room.players.values()]
  }

  getPlayerByName(name: string): Player | undefined{
    return this.room.getPlayer(name)
  }
  addMove(move: Move){
    this.moves.push(move)
    this.updateLastActivity()
  }
  addVote(vote: Vote){
    this.votes.push(vote)
    this.updateLastActivity()
  }
  addRoundResult(roundResult : RoundResult){
    this.roundResults.push(roundResult)
    this.updateLastActivity()
  }
  getLastRoundResult() : RoundResult {
    return this.roundResults[this.roundResults.length-1]
  }
  /*
    Calcula el siguiente turno disponible, iterando sobre la lista de Players.
    Le pasas un base Index y se fija, siguiendo el orden preestablecido, cual es el siguiente jugador a partir de ese index que puede jugar
    - Si esta vivo y no jugo, puede jugar
  */
  computeNextTurn(index?: number) {
    this.updateLastActivity()
    let baseIndex = index !== undefined? index:this.nextTurnIndexPlayer + 1
    while(baseIndex < this.orderToPlay.length){
        const player = this.getPlayerByName(this.orderToPlay[baseIndex])
        if(player && player.alive && !player.played) {
            this.nextTurnIndexPlayer = baseIndex
            return
        }
        baseIndex += 1
    }
    throw new Error("No hay turno disponible") // mejorar
  }
  computeFirstAvailableTurn() {
    this.computeNextTurn(0)
    this.updateLastActivity()
  }

  getMostVotedPlayers(): string[] {
    this.updateLastActivity()
    const voteMap = new Map<string, number>()
    this.votes.filter((vote: Vote) => vote.roundId === this.currentRound).forEach((vote: Vote) => {
        if(vote.votedPlayer === "") return
        const votesGivenToPlayer = voteMap.get(vote.votedPlayer) || 0
        voteMap.set(vote.votedPlayer, votesGivenToPlayer + 1)
    })
    // Una vez realizado el conteo, tengo cual es el numero maximo de votos y quienes tienen ese numero
    const { playerIds } = getPlayersWithMostVotes(voteMap);
    return playerIds
  }
  killPlayer(playerName: string) {
    const player = this.getPlayerByName(playerName)
    if(player){
      player.die()
      player.joinChannel(`${this.room.id}:dead`)
    }
    this.updateLastActivity()
  }
  isPlayerDead(playerName: string) { return this.room.isPlayerDead(playerName)}

  hasCrewWon(lossers: string[]) { return lossers.length === 1 && lossers[0] === this.impostor}

  hasImpostorWon(lossers: string[]){
      return this.getPlayersAsList().filter((player: Player) => player.alive).length === 2 
          && lossers.length === 1 
          && lossers[0] !== this.impostor
  }

  updateLastActivity() {
    this.lastActivityAt = new Date();
  }

  isIdle(maxIdleMs: number): boolean { // la idea es volar los que queden huerfanos
    return Date.now() - this.lastActivity.getTime() > maxIdleMs
  }

  /* =====================
     Cleanup
     ===================== */
  cleanup() {
    this.room.getPlayersAsList().forEach((player: Player) => {
      player.cleanUp(this)
    })
  }

  /* =====================
     Handler Player Left / Disconnect
     ===================== */
  disconnectPlayer(playerName: string){
    const player = this.getPlayerByName(playerName)
    if(!player) throw new PlayerNotFoundError(playerName, this.id)

    player.disconnect(this)
  }
  
  validStateToPlay(){
    // Esta en un estado valido si hay al menos 3 jugadores y uno de ellos es el impostor
    const playersAlive = this.getPlayersAsList()
      .filter((player: Player) => player.alive)

    return playersAlive.some((player: Player) => player.name === this.impostor) && playersAlive.length >=3
      
  }

}
