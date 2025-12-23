import { AppError } from "./AppError";
import { AppErrorCode } from "./AppErrorCode";

export class RoomNotFoundError extends AppError {
    public readonly code = AppErrorCode.ROOM_NOT_FOUND
    constructor(roomId: string){
        super(`Room ${roomId} not found`)
    }
}