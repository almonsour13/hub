import express from "express";
import cors from "cors";
import { createServer } from "http";
import AuthRoute from "./route/auth-route";
import { requestLogger } from "./middleware/request-logger";
import HubRoute from "./route/hub-route";
import WebSocketServer from "./socket/socket";
import ChatRoute from "./route/chat-route";

const app = express();
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);


const httpServer = createServer(app);
const wsServer = new WebSocketServer(httpServer);
app.use(express.json());
app.use(requestLogger);

app.use("/api/auth/", AuthRoute);
app.use("/api/hub/", HubRoute);
app.use("/api/chat/", ChatRoute);


export const getWebSocketServer = () => wsServer;

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
