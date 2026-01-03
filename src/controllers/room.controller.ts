import { Request, Response, NextFunction } from "express";
import { CreateRoomDto, createRoomSchema } from "../lib";
import { roomService } from "../services";

export const createRoomHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: CreateRoomDto = createRoomSchema.parse(req.body);

    const room = await roomService.createRoom(data);

    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};
