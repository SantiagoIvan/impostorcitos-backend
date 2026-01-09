import { appendFileSync, mkdirSync, existsSync } from "fs";
import { dirname } from "path";
import { ILogger } from "./ILogger";

type LogLevel = "INFO" | "WARN" | "ERROR";

export class FileLogger implements ILogger {
  private readonly filePath: string;
  private readonly context?: string;

  constructor(filePath: string, context?: string) {
    this.filePath = filePath;
    this.context = context;

    this.ensureLogDirectoryExists();
  }

  info(message: string, meta?: unknown): void {
    this.write("INFO", message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.write("WARN", message, meta);
  }

  error(message: string, meta?: unknown): void {
    this.write("ERROR", message, meta);
  }

  withContext(context: string): ILogger {
    const combinedContext = this.context
      ? `${this.context}:${context}`
      : context;

    return new FileLogger(this.filePath, combinedContext);
  }

  private write(level: LogLevel, message: string, meta?: unknown): void {
    const timestamp = new Date().toISOString();

    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      meta,
    };

    appendFileSync(
      this.filePath,
      JSON.stringify(logEntry) + "\n",
      { encoding: "utf-8" }
    );
  }

  private ensureLogDirectoryExists(): void {
    const dir = dirname(this.filePath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
}
