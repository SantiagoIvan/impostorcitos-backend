import { AppError } from "./AppError";
import { AppErrorCode } from "./AppErrorCode";
import { HttpError } from "./HttpError";

export class IncorrectPassword extends HttpError {
    public readonly code: string = AppErrorCode.INCORRECT_PASSWORD
    public readonly httpCode: number = 400
  constructor(message = "Password was incorrect") {
    super(message);
  }
}
