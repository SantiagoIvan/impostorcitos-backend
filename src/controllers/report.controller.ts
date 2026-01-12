import { Request, Response, NextFunction } from "express";
import { reportService } from "../services/report.service";
import { ReportDto } from "../lib";

export const createReportHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: ReportDto = req.body;
    await reportService.saveReport(data);
    res.status(201).json({data: "ok"});
  } catch (error) {
    next(error);
  }
};