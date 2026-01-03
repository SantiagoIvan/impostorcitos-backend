import { AppError } from "./AppError";
import { AppErrorCode } from "./AppErrorCode";
import { HttpError } from "./HttpError";

export class RoomNotCreated extends HttpError {
    public readonly code: string = AppErrorCode.ROOM_NOT_CREATED
    public readonly httpCode: number = 400
  constructor(message = "No se pudo crear la sala") {
    super(message);
  }
}
