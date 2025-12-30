import { Game } from "../domain";
import { GameDto } from "../lib";
import { toRoomDTO } from "./room.mapper";
import { toVoteArrayDTO } from "./vote.mapper";

export function toGameDTO(game: Game, clientName: string | undefined = undefined): GameDto {
  return {
    id: game.id,
    room: toRoomDTO(game.room),
    topic: game.topic,
    moves: game.moves,
    votes: toVoteArrayDTO(game.votes),
    impostor: clientName === game.impostor,
    impostorWonTheGame: game.impostorWon,
    currentTurn: game.getCurrentTurn,
    nextTurnIndexPlayer: game.getNextTurnIndexPlayer,
    currentPhase: game.getCurrentPhase,
    currentRound: game.getCurrentRound,
    secretWord: clientName!==game.impostor? game.secretWord : undefined
  };
}
