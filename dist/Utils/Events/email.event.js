"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailSubject = exports.emailEvent = void 0;
const xoauth2_1 = require("nodemailer/lib/xoauth2");
const htmlEmail_1 = require("../Email/htmlEmail");
const sendEmail_1 = require("../Email/sendEmail");
exports.emailEvent = new xoauth2_1.EventEmitter();
exports.emailSubject = {
    confirmEmail: "Confirm Your Email",
    twoFA: "Verify Your Login",
    resetPassword: "Reset Your Password",
    welcome: "Welcome To Rout Academy",
};
exports.emailEvent.on("ConfirmEmail", async (data) => {
    try {
        data.subject = exports.emailSubject.confirmEmail;
        data.html = (0, htmlEmail_1.template)(data.otp, data.username, data.subject);
        await (0, sendEmail_1.sendEmail)(data);
    }
    catch (err) {
        console.log(`Error sending confirm email ${err}`);
    }
});
exports.emailEvent.on("forgetpassword", async (data) => {
    try {
        data.subject = exports.emailSubject.resetPassword;
        data.html = (0, htmlEmail_1.template)(data.otp, data.username, exports.emailSubject.resetPassword);
        await (0, sendEmail_1.sendEmail)(data);
    }
    catch (err) {
        console.log(`Error sending confirm email ${err}`);
    }
});
exports.emailEvent.on("2FA-Login-OTP", async (data) => {
    try {
        data.subject = exports.emailSubject.twoFA;
        data.html = (0, htmlEmail_1.template)(data.otp, data.username, exports.emailSubject.twoFA);
    }
    catch (err) {
        console.log(`Error sending 2FA login email: ${err}`);
    }
});
