import { AppError } from "./AppError";

export abstract class HttpError extends AppError{
    abstract readonly httpCode: number
    protected constructor(msg: string){
        super(msg)
    }
}