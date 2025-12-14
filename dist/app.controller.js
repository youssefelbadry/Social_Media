"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("./Modules/Auth/auth.controller"));
const user_controller_1 = __importDefault(require("./Modules/Users/user.controller"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = require("dotenv");
const error_res_1 = require("./Utils/Responsive/error.res");
(0, dotenv_1.config)({ path: node_path_1.default.resolve("./config/.env.dev") });
const limit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: {
        status: 429,
        message: "Too many request , p;ease try again later",
    },
});
const bootstrab = () => {
    const app = (0, express_1.default)();
    const port = Number(process.env.PORT) || 5000;
    app.use((0, cors_1.default)(), (0, helmet_1.default)(), express_1.default.json());
    app.use(limit);
    app.use("/api/v1/auth", auth_controller_1.default);
    app.use("/api/v1/users", user_controller_1.default);
    app.use("{/dummy}", (req, res) => {
        res.status(404).json({ message: "not founded" });
    });
    app.listen(port, () => {
        console.log(`Server is running om http://localhost:${port}`);
    });
    app.use(error_res_1.globalErrorHandling);
};
exports.default = bootstrab;
