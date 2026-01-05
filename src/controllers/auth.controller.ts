import { Request, Response, NextFunction } from "express";
import { loginUser, logoutUser } from "../services";

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
    const result = await loginUser(username); // No jode que sea await asi en el futuro no lo cambio cuando me integre con redis o algo

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username } = req.body;
    const result = await logoutUser(username); 

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

