import { Report } from "../domain"
import { ReportDto } from "../lib"
import { ConsoleLogger, ILogger } from "../logger"
import fs from "fs"
import path from "path"

const REPORTS_DIR = path.join(process.cwd(), "src", "reports")
const REPORTS_FILE = path.join(REPORTS_DIR, "bug-reports.log")

class ReportService {
    constructor(
        private readonly logger: ILogger
    ){}
    async saveReport(data: ReportDto): Promise<void>{
        this.logger.info(`Creating report...`)
        // agregarlo al final del archivo como un  {date: xxxxxx, report: ""}
        const newReport = new Report(data.report.trim())
        this.logger.warn(`Reported created: ${newReport}. Saving to file...`)

    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true })
    }

    const line = JSON.stringify(newReport) + "\n"

    fs.appendFileSync(REPORTS_FILE, line, { encoding: "utf-8" })
        this.logger.info(`Report created successfully`)
    }
}

export const reportService = new ReportService(
    new ConsoleLogger(ReportService.name)
)