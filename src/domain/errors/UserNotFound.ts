import { AppError } from "./AppError";
import { AppErrorCode } from "./AppErrorCode";

export class UserNotFoundError extends AppError {
    public readonly code = AppErrorCode.USER_NOT_FOUND
    constructor(userId: string){
        super(`User ${userId} not found`)
    }
}