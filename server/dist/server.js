"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const auth_route_1 = __importDefault(require("./route/auth-route"));
const request_logger_1 = require("./middleware/request-logger");
const hub_route_1 = __importDefault(require("./route/hub-route"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
const httpServer = (0, http_1.createServer)(app);
app.use(express_1.default.json());
app.use(request_logger_1.requestLogger);
app.use("/api/auth/", auth_route_1.default);
app.use("/api/hub/", hub_route_1.default);
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
