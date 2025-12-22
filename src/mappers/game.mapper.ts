import { Game } from "../domain";
import { GameDto } from "../lib";
import { toRoomDTO } from "./room.mapper";

export function toGameDTO(game: Game, impostorFlag: boolean = false): GameDto {
  return {
    id: game.id,
    room: toRoomDTO(game.room),
    topic: game.topic,
    moves: game.moves,
    votes: game.votes,
    impostor: impostorFlag,
    impostorWonTheGame: game.impostorWon,
    currentTurn: game.getCurrentTurn,
    nextTurnIndexPlayer: game.getNextTurnIndexPlayer,
    currentPhase: game.getCurrentPhase,
    currentRound: game.getCurrentRound,
    secretWord: !impostorFlag? game.secretWord : undefined
  };
}
