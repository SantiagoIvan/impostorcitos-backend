import { Room } from "../../domain/room";
import { IRepository } from "../IRepository";

export interface IRoomRepository extends IRepository<Room> {
  findPublicRooms(): Room[];
  isFull(id: string): boolean;
  IsPlayerInRoom(name: string, roomId: string): boolean;
}