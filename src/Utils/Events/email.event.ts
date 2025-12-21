import { EventEmitter } from "nodemailer/lib/xoauth2";
import Mail from "nodemailer/lib/mailer";
import { template } from "../Email/htmlEmail";
import { sendEmail } from "../Email/sendEmail";
export const emailEvent = new EventEmitter();

export interface IEmail extends Mail.Options {
  otp: number;
  username: string;
}

export const emailSubject = {
  confirmEmail: "Confirm Your Email",
  twoFA: "Verify Your Login",
  resetPassword: "Reset Your Password",
  welcome: "Welcome To Rout Academy",
};

emailEvent.on("ConfirmEmail", async (data: IEmail) => {
  try {
    data.subject = emailSubject.confirmEmail;
    data.html = template(data.otp, data.username, data.subject);
    await sendEmail(data);
  } catch (err) {
    console.log(`Error sending confirm email ${err}`);
  }
});
emailEvent.on("forgetpassword", async (data: IEmail) => {
  try {
    data.subject = emailSubject.resetPassword;
    data.html = template(data.otp, data.username, emailSubject.resetPassword);
    await sendEmail(data);
  } catch (err) {
    console.log(`Error sending confirm email ${err}`);
  }
});
emailEvent.on("2FA-Login-OTP", async (data: IEmail) => {
  try {
    data.subject = emailSubject.twoFA;
    data.html = template(data.otp, data.username, emailSubject.twoFA);
  } catch (err) {
    console.log(`Error sending 2FA login email: ${err}`);
  }
});
