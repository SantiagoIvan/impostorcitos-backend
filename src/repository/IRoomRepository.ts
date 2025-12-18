import { Room } from "../domain/room";
import { IRepository } from "./IRepository";

export interface IRoomRepository extends IRepository<Room> {
  findPublicRooms(): Room[];
  isRoomFull(roomId: string) : boolean;
}
