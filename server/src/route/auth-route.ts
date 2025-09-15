import { Router } from "express";
import { googleSignin, register, signin } from "../controller/auth-controller";

const AuthRoute = Router();

AuthRoute.post("/signup", register);
AuthRoute.post("/signin", signin);
AuthRoute.post("/google-signin", googleSignin);

export default AuthRoute;
