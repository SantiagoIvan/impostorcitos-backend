import { ILogger } from "./ILogger";

export class ConsoleLogger implements ILogger {
  constructor(private readonly context?: string) {}

  withContext(context: string): ILogger {
    return new ConsoleLogger(context);
  }

  info(message: string, meta?: unknown) {
    console.log(this.format("INFO", message), meta);
  }

  warn(message: string, meta?: unknown) {
    console.warn(this.format("WARN", message), meta);
  }

  error(message: string, meta?: unknown) {
    console.error(this.format("ERROR", message), meta);
  }

  private format(level: string, message: string): string {
    return this.context
      ? `[${level}] [${this.context}] ${message}`
      : `[${level}] ${message}`;
  }
}
