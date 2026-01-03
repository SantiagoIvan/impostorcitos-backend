import { AppErrorCode } from "./AppErrorCode";
import { HttpError } from "./HttpError";

export class UserAlreadyExistsError extends HttpError {
    public readonly code = AppErrorCode.USER_EXISTS
    public readonly httpCode = 401
    constructor(username: string){
        super(`User ${username} already exists!`)
    }
}