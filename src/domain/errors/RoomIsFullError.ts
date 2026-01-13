import { AppErrorCode } from "./AppErrorCode";
import { HttpError } from "./HttpError";

export class RoomIsFullError extends HttpError {
    public readonly code: string = AppErrorCode.ROOM_IS_FULL
    public readonly httpCode: number = 500
  constructor(message = "Room is full") {
    super(message);
  }
}
