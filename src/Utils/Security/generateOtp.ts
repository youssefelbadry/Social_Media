import { emailEvent } from "../Events/email.event";

export class Otp {
  static generateOtp = (): string => {
    return String(Math.floor(Math.random() * (900000 - 100000) + 100000));
  };

  static otpExpiresAt = (): Date => {
    return new Date(Date.now() + Number(process.env.OTPEXPIRES_AT));
  };
}

export const emailService = (email: string, username: string, otp: string) => {
  emailEvent.emit("ConfirmEmail", {
    to: email,
    username,
    otp,
  });
};
