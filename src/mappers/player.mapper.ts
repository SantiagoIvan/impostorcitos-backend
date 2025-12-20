import { Player } from "../domain/player";
import { PlayerDto } from "../lib";

export function toPlayerDTO(player: Player): PlayerDto {
  return {
    name: player.name,
    hasPlayed: player.played,
    isAlive: player.alive,
    isReady: player.ready,
    skipPhase: player.skippedPhase
  };
}
