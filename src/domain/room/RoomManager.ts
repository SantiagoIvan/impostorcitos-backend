import { nextSeqRoom } from "../../db";
import { CreateRoomDto } from "../../lib";
import { InMemoryRoomRepository } from "../../repository/room/InMemoryRoomRepository";
import { RoomRepository } from "../../repository/room/RoomRepository";
import { Room } from "./Room";

export class RoomManager {
    constructor(
        private readonly roomRepository: RoomRepository
    ){}

    createRoom(roomDto: CreateRoomDto) : Room {
        const newRoom = new Room(
            nextSeqRoom(), 
            roomDto.privacy,
            roomDto.admin,
            roomDto.name,
            new Date(),
            roomDto.discussionTime,
            roomDto.voteTime,
            roomDto.moveTime,
            roomDto.maxPlayers,
        )
        this.roomRepository.save(newRoom)
        console.log("[ROOM_MANAGER] Room creado: ", newRoom)
        return newRoom
    }
    getRoomById(id: string) : Room | undefined {
        return this.roomRepository.getById(id)
    }
    getRooms() : Room[] {
        return this.roomRepository.getAll()
    }
    deleteRoomById(id: string) {
        this.roomRepository.delete(id)
    }
    getPublicRooms() : Room[] {
        return this.roomRepository.findPublicRooms()
    }
    isRoomFull(id: string) : boolean {
        return this.roomRepository.isFull(id)
    }
    isPlayerInRoom(playerName: string, roomId: string) : boolean{
        return this.roomRepository.IsPlayerInRoom(playerName, roomId)
    }
}

export const roomManager = new RoomManager(new InMemoryRoomRepository())