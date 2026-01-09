import { Player, PlayerNotFoundError, Room, RoundResult, RoundResultFactory } from '../';
import { Team, Turn, getPlayersWithMostVotes, shuffle } from '../../lib';
import { transformSecondsToMS } from '../../lib';
import { GamePhase, Move, Vote } from "../../domain"
import { GENERAL_CHAT_CHANNEL } from '../..';
import { RandomGeneratorService } from '../../services';

export class Game {
  public readonly createdAt: Date = new Date();
  private moves: Move[] = []
  private votes: Vote[] = []
  private roundResults : RoundResult[] = []
  private nextTurnIndexPlayer: number = 0
  private impostorWonTheGame: boolean = false
  private currentRound: number = 1
  private currentPhase: GamePhase = GamePhase.PLAY
  private aborted: boolean = false

  constructor(
    public readonly id: string,
    private lastActivityAt: Date,
    public readonly room: Room,
    public topic: string,
    private impostor: string,
    private secretWord: string,
    private orderToPlay: string[],
    private currentTurn: Turn,
  ) {}
  getRoundResults(){
    return this.roundResults
  }
  getOrderToPlay(){
    return this.orderToPlay
  }
  getImpostor(){
    return this.impostor
  }
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
  get getAborted() {
    return this.aborted
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
  getMoves() {
    return this.moves
  }
  getVotes(){
    return this.votes
  }
  getSecretWord(){
    return this.secretWord
  }
  setSecretWord(word: string){
    this.secretWord = word
  }
  abort(){
    this.currentPhase = GamePhase.ROUND_RESULT
    this.aborted = true
    this.addRoundResult(RoundResultFactory.createRoundResultDto(this, []))
  }
  resetPlayersState(): void {
    this.room.players.forEach((p: Player) => {
      p.resetPlayerState()
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
  getAlivePlayers(): Player[] {
    return this.getPlayersAsList().filter((player: Player) => player.alive && player.connected)
  }
  getConnectedPlayers(): Player[] {
    return this.getPlayersAsList().filter((player: Player) => player.connected)
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
        console.log(`Desde computeNextTurn name alive hasplayed`, player?.name, player?.alive, player?.played, player?.connected)
        if(player && player.canPlay()) {
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

  reviveAllPlayers(){
    this.getPlayersAsList()
      .filter((player: Player) => player.connected)
      .forEach((player: Player) => {
      player.revive()
    })
  }

  isPlayerDead(playerName: string) { return this.room.isPlayerDead(playerName)}

  hasCrewWon() { 
    const lastRound = this.getLastRoundResult()
    return lastRound.winner?.team === Team.CREW
  }

  hasImpostorWon(){
    const lastRound = this.getLastRoundResult()
    return lastRound.winner?.team === Team.IMPOSTOR
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
      player.cleanUpGameListeners(this)
      player.socket?.leave(this.id)
      player.socket?.join(GENERAL_CHAT_CHANNEL)
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
    /*
    Si la partida esta en curso, simplemente me fijo la cantidad de jugadores vivos y si uno de ellos es el impostor

    Si la partida ya termino, es decir, tomamos el lastRoundResult y tiene un winner, ENTONCES:
    - Si el que quitea es ADMIN => no es valido
    - Me fijo la cantidad de jugadores conectados, ignorando quien es el impostor
    */
    // Esta en un estado valido si hay al menos 3 jugadores y uno de ellos es el impostor
    const hasFinished = this.getLastRoundResult()?.winner // Si se va alguien en la primera ronda, todavia no hay lastRound, por lo que puede ser undefined
    
    let playersList = hasFinished? 
    this.getAlivePlayers() :
    this.getConnectedPlayers()

    if(hasFinished && !playersList.some((player: Player) => player.name === this.room.admin)) return false
    return hasFinished ? 
    playersList.some((player: Player) => player.name === this.impostor) && playersList.length >=3 :
    playersList.length >=3
      
  }

  restart(newTopic: string, randomFlag: boolean){
    /*
      1. Reseteamos el estado de cada jugador, haciendo que no este listo, que este vivo y que no haya skipeado fase si es que esta conectado
      2. Revivimos a todos los conectados
      3. Limpiamos votos, jugadas y rondas
      4. Generamos el nuevo topico random de acuerdo al random flag que nos llega (si el usuario hizo click en el check de random)
      5. Lo guardamos en Game, que es donde esta el topico de la partida actual 
        (en Room esta el topico con el que se configuro la partida cuado se creo en su momento nomas, es una copia de ese objeto para tener la metadata de la sala)
      6.Recalculamos la palabra secreta de acuerdo al topico calculado
      7. Recalculamos el impostor
      8. Recalculamos el orden a jugar
      9. Seteamos la fase del juego en Play y calculamos quien jugaria primero, teniendo en cuenta los jugadores conectados
      10. Configuramos el turno seteandolo en Game ( startturn() )

      Si por alguna casualidad los jugadores se van desconectando, el sistema se dara cuenta por el handleDisconnectPlayer que el juego estara en un estado invalido
      Por lo tanto no se podra seguir jugando, y a los que se hayan quedado, les saltara el cartel de partida abortada y se les cerraran los listener del juego
    */
    this.resetPlayersState()
    this.reviveAllPlayers()
    this.votes = []
    this.moves = []
    this.roundResults = []
    this.aborted = false
    this.topic = randomFlag? RandomGeneratorService.generateRandomTopic() : newTopic
    this.secretWord = RandomGeneratorService.generateRandomWordFromTopic(this.topic)
    this.impostor = RandomGeneratorService.generateRandomPlayer(this.getConnectedPlayers())
    this.orderToPlay = shuffle(this.getConnectedPlayers().map((player: Player) => player.name))
    this.currentPhase =GamePhase.PLAY
    this.computeFirstAvailableTurn()
    this.startTurn()

  }
}
