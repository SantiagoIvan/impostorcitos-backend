import { nextSeqRoom } from "../../db";
import { CreateRoomDto } from "../../lib";
import { ConsoleLogger, ILogger } from "../../logger";
import { InMemoryRoomRepository } from "../../repository/room/InMemoryRoomRepository";
import { IRoomRepository } from "../../repository/room/IRoomRepository";
import { Player } from "../player";
import { Room } from "./Room";

export class RoomManager {
    constructor(
        private readonly roomRepository: IRoomRepository,
        private readonly logger: ILogger
    ){
        this.logger = logger.withContext(RoomManager.name);
    }

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
        this.logger.info("[RoomManager] Room creado: ", newRoom)
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
    addPlayerToRoom(player: Player, roomId: string) : Room {
        const room = this.roomRepository.getById(roomId)
        if(room){
            room.addPlayer(player)
            this.roomRepository.save(room)
            this.logger.info(`Se ha unido ${player.name} a la sala ${room.id}: Cantidad de jugadores: ${room.getPlayerCount()}`, room)
            return room
        }
        throw new Error(`[RoomManager] Sala ${roomId} inexistente`) // mejorar
    }
    removePlayerfromRoom(playerName: string, roomId: string): Room {
        const room = this.roomRepository.getById(roomId)
        if(room){
            room.players.delete(playerName)
            this.logger.info(`${playerName} ha dejado la sala ${room.id}: Cantidad de jugadores: ${room.getPlayerCount()}`, room)
            return room
        }
        throw new Error(`[RoomManager] Sala ${roomId} inexistente`) // mejorar
    }
    togglePlayerReadyInRoom(playerName: string, roomId: string): Room {
        const room = this.roomRepository.getById(roomId)
        if(!room) throw new Error(`[RoomManager] Sala ${roomId} inexistente`) // mejorar

        const targetPlayer = room.players.get(playerName)
        if(!targetPlayer) throw new Error(`[RoomManager] Jugador inexistente en la sala ${roomId}`) // mejorar
        
        targetPlayer.toogleIsReady()
        this.logger.info(`${playerName} esta listo.`, room)
        return room
    }
}

export const roomManager = new RoomManager(
    new InMemoryRoomRepository(), 
    new ConsoleLogger()
)