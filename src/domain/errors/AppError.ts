export abstract class AppError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
  }
}
