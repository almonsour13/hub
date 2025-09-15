"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controller/auth-controller");
const AuthRoute = (0, express_1.Router)();
AuthRoute.post("/signup", auth_controller_1.register);
AuthRoute.post("/signin", auth_controller_1.signin);
AuthRoute.post("/google-signin", auth_controller_1.googleSignin);
exports.default = AuthRoute;
