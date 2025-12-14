"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_res_1 = require("../../Utils/Responsive/error.res");
class AuthentcationService {
    constructor() { }
    signup = (req, res, next) => {
        throw new error_res_1.NotFoundException("notfound", { cause: "anything" });
        res.status(201).json({ message: "sign" });
    };
}
exports.default = new AuthentcationService();
