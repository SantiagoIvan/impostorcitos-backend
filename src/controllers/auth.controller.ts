import { Request, Response, NextFunction } from "express";
import { loginUser } from "../services";

interface LoginRequestBody {
  username: string;
  password: string;
}

export const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username } = req.body; // Eventualmente aca iria el password tambien
    const result = await loginUser(username);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
