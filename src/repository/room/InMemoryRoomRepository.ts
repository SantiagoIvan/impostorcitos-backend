import { Room } from "../../domain/room";
import { InMemoryMapRepository } from "../InMemoryRepository";
import { IRoomRepository } from "./IRoomRepository";

export class InMemoryRoomRepository
  extends InMemoryMapRepository<Room>
  implements IRoomRepository {

  findPublicRooms(): Room[] {
    return this.getAll().filter(room => room.isPublic());
  }
  isFull(id: string): boolean {
    return this.getById(id)?.isFull() || false
  }
  IsPlayerInRoom(name: string, roomId: string): boolean {
    return this.getById(roomId)?.hasPlayer(name) || false
  }
}
