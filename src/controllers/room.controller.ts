import { Request, Response, NextFunction } from "express";
import { CreateRoomDto, createRoomSchema, JoinRoomDto, RoomEvents } from "../lib";
import { roomService } from "../services";
import { toRoomDTO, toRoomDTOArray } from "../mappers";
import { Player, roomManager } from "../domain";
import { io } from "..";

export const createRoomHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: CreateRoomDto = createRoomSchema.parse(req.body);

    const room = await roomService.createRoom(data);
    io.emit(RoomEvents.CREATED, toRoomDTO(room))
    res.status(201).json(toRoomDTO(room));
  } catch (error) {
    next(error);
  }
};

export const getRoomsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rooms = await roomManager.getRooms();

    res.status(201).json(toRoomDTOArray(rooms));
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    console.log("Searching room ", id)
    const room = roomService.getRoomById(id);
    console.log("Found ", room)
    
    if (!room) {
      res.status(404).json({
        message: "Room not found",
      });
      return
    }

    res.status(200).json(toRoomDTO(room));
  } catch (error) {
    console.error("Error fetching room:", error);
    next(error)
  }
};

export const joinRoomController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try{
    const data: JoinRoomDto = req.body;
    console.log("Trying to join room", data)
    const room = roomService.joinRoom(data);
    console.log("Updated room: ", room)
    room.getPlayersAsList().forEach((player: Player) => {
      player.socket?.emit(RoomEvents.JOINED, toRoomDTO(room))
    })
    res.status(201).json(toRoomDTO(room))
  }catch(err){
    next(err)
  }
}
