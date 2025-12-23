import { AppError } from "./AppError";
import { AppErrorCode } from "./AppErrorCode";

export class GameNotFoundError extends AppError {
    public readonly code = AppErrorCode.GAME_NOT_FOUND
    constructor(gameId: string){
        super(`Game ${gameId} not found`)
    }
}