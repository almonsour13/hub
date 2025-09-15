"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const logger_1 = require("../lib/logger");
function requestLogger(req, res, next) {
    logger_1.logger.debug("➡️ Request Recieved:", {
        method: req.method,
        path: req.originalUrl,
        body: req.body,
        query: req.query,
    });
    next();
}
