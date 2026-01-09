import { Request, Response, NextFunction } from "express";

export const ping = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({data: "Pong"});
  } catch (error) {
    next(error);
  }
};
