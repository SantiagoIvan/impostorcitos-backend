import { AppError } from "./AppError";
import { AppErrorCode } from "./AppErrorCode";

export class PlayerNotFoundError extends AppError {
    public readonly code = AppErrorCode.PLAYER_NOT_FOUND
    constructor(name: string, gameId: string){
        super(`Player ${name} not found in Game/Room ${gameId}`)
    }
}