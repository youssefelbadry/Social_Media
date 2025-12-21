"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.Otp = void 0;
const email_event_1 = require("../Events/email.event");
class Otp {
    static generateOtp = () => {
        return String(Math.floor(Math.random() * (900000 - 100000) + 100000));
    };
    static otpExpiresAt = () => {
        return new Date(Date.now() + Number(process.env.OTPEXPIRES_AT));
    };
}
exports.Otp = Otp;
const emailService = (email, username, otp) => {
    email_event_1.emailEvent.emit("ConfirmEmail", {
        to: email,
        username,
        otp,
    });
};
exports.emailService = emailService;
