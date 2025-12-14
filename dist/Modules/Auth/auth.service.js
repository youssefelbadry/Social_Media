"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthentcationService {
    constructor() { }
    signup = async (req, res) => {
        const { username, email, password, confirmPassword } = req.body;
        console.log({ username, email, password, confirmPassword });
        res.status(201).json({ message: "signUp is sucssefuly" });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        console.log({ email, password });
        res.status(201).json({ message: "login is sucssefuly" });
    };
}
exports.default = new AuthentcationService();
