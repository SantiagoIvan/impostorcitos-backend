import { Player } from "../../domain/player";
import { Room } from "../../domain/room";
import { InMemoryRepository } from "../InMemoryRepository";
import { IRoomRepository } from "./IRoomRepository";

export class InMemoryRoomRepository
  extends InMemoryRepository<Room>
  implements IRoomRepository {

  findPublicRooms(): Room[] {
    return this.getAll().filter(room => room.isPublic());
  }
  isFull(id: string): boolean {
    return this.getById(id)?.isFull() || false
  }
  IsPlayerInRoom(name: string, roomId: string): boolean {
    return this.getById(roomId)?.players.some((player: Player) => player.name === name) || false
  }
}
