import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    logger.debug("➡️ Request Recieved:", {
        method: req.method,
        path: req.originalUrl,
        body: req.body,
        query: req.query,
    });
    next();
}
