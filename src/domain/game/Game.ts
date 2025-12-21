import { Room } from '../';
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
    private room: Room,
    private topic: string,
    private secretWord: string,
    private impostor: string,
    private orderToPlay: string[],
    private currentTurn?: Turn,
    private turnTimeout?: NodeJS.Timeout
  ) {}
  /*
    
  
  */

  /* =====================
     Turn / timers
     ===================== */

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

  /* =====================
     Activity / lifecycle
     ===================== */

  updateLastActivity() {
    this.lastActivityAt = new Date();
  }

  isIdle(maxIdleMs: number): boolean {
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
