import { Request, Response, NextFunction } from "express";
import { CreateRoomDto, createRoomSchema, JoinRoomDto, RoomEvents } from "../lib";
import { roomService } from "../services";
import { toRoomDTO, toRoomDTOArray } from "../mappers";
import { roomManager } from "../domain";
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

export const joinRoomController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try{
    const data: JoinRoomDto = req.body;
    console.log(data)
    const room = await roomService.joinRoom(data);
    io.emit(RoomEvents.JOINED, toRoomDTO(room))
    res.status(201).json(toRoomDTO(room))
  }catch(err){
    next(err)
  }
}
