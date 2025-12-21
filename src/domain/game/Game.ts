import { Player, Room } from '../';
import { GamePhase, Move, Turn, Vote } from '../../lib';

export class Game {
  public readonly createdAt: Date = new Date();
  public readonly moves: Move[] = []
  public readonly votes: Vote[] = []
  private nextTurnIndexPlayer: number = 0
  private impostorWonTheGame: boolean = false
  private currentRound: number = 0
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
    private turnTimeout?: NodeJS.Timeout
  ) {}

  startTurn(durationMs: number, onTimeout: () => void) {
    this.clearTurnTimeout();

    this.turnTimeout = setTimeout(() => {
      onTimeout();
    }, durationMs);

    this.updateLastActivity();
  }

  clearTurnTimeout() {
    if (this.turnTimeout) {
      clearTimeout(this.turnTimeout);
      this.turnTimeout = undefined;
    }
  }
  allReady(){
    return [...this.room.players.values()].every((player: Player) => player.ready)
  }

  get impostorWon() {
    return this.impostorWonTheGame
  }
  get getCurrentTurn() {
    return this.currentTurn
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
  /* =====================
     Activity / lifecycle
     ===================== */

  updateLastActivity() {
    this.lastActivityAt = new Date();
  }

  isIdle(maxIdleMs: number): boolean { // la idea es volar los que queden huerfanos
    //return Date.now() - this.lastActivityAt > maxIdleMs;
    return false
  }

  /* =====================
     Cleanup
     ===================== */

  cleanup() {
    this.clearTurnTimeout();
/*
    for (const player of this.players) {
      if (player.gameListeners) {
        const { socket, gameListeners } = player;
        socket.off('play:word', gameListeners.playWord);
        socket.off('leave:game', gameListeners.leaveGame);
        player.gameListeners = undefined;
      }

      player.socket.leave(this.id);
    }
*/
  }
}
