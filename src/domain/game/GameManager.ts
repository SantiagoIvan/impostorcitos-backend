import { nextSeqGame } from "../../db";
import { Game } from "./Game";

class GameManager {
  private games = new Map<string, Game>();

  createGame(): Game {
    const game = new Game(nextSeqGame());
    this.games.set(game.id, game);
    return game;
  }

  get(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  endGame(gameId: string) {
    const game = this.games.get(gameId);
    if (!game) return;

    game.cleanup();
    this.games.delete(gameId);
  }

  getAll(): IterableIterator<Game> {
    return this.games.values();
  }
}
export const gameManager = new GameManager()