import { Request, Response, NextFunction } from "express";

export const ping = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({data: "Pong v1"});
  } catch (error) {
    next(error);
  }
};
