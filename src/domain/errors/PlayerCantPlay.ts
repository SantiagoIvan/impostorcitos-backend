import { AppError } from "./AppError";
import { AppErrorCode } from "./AppErrorCode";

export class PlayerCantPlay extends AppError {
    public readonly code = AppErrorCode.PLAYER_CANT_PLAY
    constructor(name: string, gameId: string){
        super(`Player ${name} cant play in Game ${gameId}`)
    }
}