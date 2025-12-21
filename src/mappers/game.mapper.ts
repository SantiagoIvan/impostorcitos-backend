import { Player } from "../domain/player";
import { Room } from "../domain/room";
import { RoomDto } from "../lib";
import { toPlayerDTO } from "./player.mapper";

export function toGameDto(game: Game): GameDto {
  return {
    id: game.id,
  };
}
