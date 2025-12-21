import { Player } from "../domain/player";
import { Room } from "../domain/room";
import { RoomDto } from "../lib";
import { toPlayerDTO } from "./player.mapper";

export function toRoomDTO(room: Room): RoomDto {
  return {
    id: room.id,
    privacy: room.privacy,
    createdAt: room.createdAt.toISOString(),
    admin: room.admin,
    name: room.name,
    discussionTime: room.discussionTime,
    voteTime: room.voteTime,
    moveTime: room.moveTime,
    maxPlayers: room.maxPlayers,
    players: [...room.players.values()].map((player: Player) => toPlayerDTO(player))
  };
}

export function toRoomDTOArray(rooms: Room[]): RoomDto[] {
  return rooms.map((room: Room) => toRoomDTO(room))
}
