import { Request, Response, NextFunction } from "express";

export const delayMiddleware = (ms: number) => {
    return (_req: Request, _res: Response, next: NextFunction) => {
        setTimeout(() => {
            next();
        }, ms);
    };
};
