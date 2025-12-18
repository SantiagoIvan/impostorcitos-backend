import { Player } from '../player/Player';

export class Game {
  public readonly id: string;
  public readonly createdAt: number;

  private players: Player[] = [];
  private turnTimeout?: NodeJS.Timeout;
  private lastActivityAt: number;

  constructor(id: string) {
    this.id = id;
    this.createdAt = Date.now();
    this.lastActivityAt = this.createdAt;
  }

  /* =====================
     Players
     ===================== */

  addPlayer(player: Player) {
    this.players.push(player);
    this.touch();
  }

  removePlayer(playerId: string) {
    this.players = this.players.filter(p => p.id !== playerId);
    this.touch();
  }

  getPlayers() {
    return this.players;
  }

  hasPlayers(): boolean {
    return this.players.length > 0;
  }

  /* =====================
     Turn / timers
     ===================== */

  startTurn(durationMs: number, onTimeout: () => void) {
    this.clearTurnTimeout();

    this.turnTimeout = setTimeout(() => {
      onTimeout();
    }, durationMs);

    this.touch();
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

  touch() {
    this.lastActivityAt = Date.now();
  }

  isIdle(maxIdleMs: number): boolean {
    return Date.now() - this.lastActivityAt > maxIdleMs;
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
    this.players = [];
  }
}
