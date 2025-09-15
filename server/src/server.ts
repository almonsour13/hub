import express from "express";
import cors from "cors";
import { createServer } from "http";
import AuthRoute from "./route/auth-route";
import { requestLogger } from "./middleware/request-logger";

const app = express();
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);


const httpServer = createServer(app);
app.use(express.json());
app.use(requestLogger);

app.use("/api/auth/", AuthRoute);



const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
