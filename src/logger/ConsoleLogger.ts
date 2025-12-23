import { ILogger } from "./ILogger";

export class ConsoleLogger implements ILogger {
  constructor(private readonly context?: string) {}

  withContext(context: string): ILogger {
    return new ConsoleLogger(context);
  }

  info(message: string, meta?: unknown): void {
    this.log("INFO", message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.log("WARN", message, meta, "\x1b[33m"); // amarillo
  }

  error(message: string, meta?: unknown): void {
    this.log("ERROR", message, meta, "\x1b[31m"); // rojo
  }

  private log(
    level: string,
    message: string,
    meta?: unknown,
    color?: string
  ) {
    const timestamp = new Date().toISOString();
    const ctx = this.context ? `[${this.context}]` : "";
    const reset = "\x1b[0m";

    const output = `${timestamp} ${level} ${ctx} ${message} ${meta || ""}`;

    if (color) {
      console.log(color + output + reset);
    } else {
      console.log(output);
    }
  }
}
