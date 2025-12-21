import { createLoginCredentials } from "./../../Utils/Security/token";
import { GenderEnum, userModel } from "./../../DB/Models/user.model";
import { Request, Response } from "express";
import { Types } from "mongoose";

import { IConfirmEmailDTO, ILoginUpDTO, ISignUpDTO } from "./auth.dto";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/Responsive/error.res";
import { userRepository } from "../../DB/Repository/user.repository";
import { emailService, Otp } from "../../Utils/Security/generateOtp";
import { compareHash, generateHash } from "../../Utils/Security/hash";
import { TokenRepository } from "../../DB/Repository/db.repository";
import { tokenModel } from "../../DB/Models/token.model";

class AuthentcationService {
  private _userModel = new userRepository(userModel);
  private _tokenModel = new TokenRepository(tokenModel);
  constructor() {}

  //SIGNUP=========================================================
  signup = async (req: Request, res: Response) => {
    const { username, email, password, gender, phone }: ISignUpDTO = req.body;
    const checkUser = await this._userModel.findOne({ filter: { email } });
    if (checkUser) throw new ConflictException("Email already exsist");

    const otp = Otp.generateOtp();
    const otpExpires = Otp.otpExpiresAt();

    const user = await this._userModel.createUser({
      data: [
        {
          username,
          email,
          password: await generateHash(password),
          gender: gender as GenderEnum,
          phone,
          confirmEmailOTP: await generateHash(otp),
          confirmEmailOTPExpiresAt: otpExpires,
        },
      ],
      options: { validateBeforeSave: true },
    });
    emailService(email, username, otp);

    res.status(201).json({
      message: "User created successfully, OTP sent to your email",
      user,
    });
  };

  //RequestOtp=========================================================
  requestConfirmEmail = async (req: Request, res: Response) => {
    const { email }: IConfirmEmailDTO = req.body;

    const checkUser = await this._userModel.findOne({
      filter: {
        email,
        confirmedAt: { $exists: false },
      },
    });

    if (!checkUser)
      throw new NotFoundException("User not founded or already confirmed");
    if (
      checkUser.confirmEmailOTPExpiresAt &&
      checkUser.confirmEmailOTPExpiresAt > new Date()
    ) {
      throw new BadRequestException("OTP already sent, please wait");
    }
    const otp = Otp.generateOtp();
    const otpExpires = Otp.otpExpiresAt();

    //Update user
    const updateUser = await this._userModel.updateOne({
      filter: { email },
      update: {
        confirmEmailOTP: await generateHash(otp),
        confirmEmailOTPExpiresAt: otpExpires,
      },
    });
    emailService(email, checkUser.username, otp);

    res.status(200).json({ message: "OTP is sent", updateUser });
  };

  //confirmEmail=========================================================
  confirmEmail = async (req: Request, res: Response) => {
    const { email, otp }: IConfirmEmailDTO = req.body;

    const checkUser = await this._userModel.findOne({
      filter: {
        email,
        confirmEmailOTP: { $exists: true },
        confirmedAt: { $exists: false },
      },
    });

    if (!checkUser) throw new NotFoundException("User not founded");

    if (checkUser.confirmEmailOTPExpiresAt! < new Date()) {
      throw new BadRequestException("OTP expired, please request a new one");
    }

    if (!(await compareHash(otp, checkUser.confirmEmailOTP as string))) {
      throw new BadRequestException("Invalid OTP");
    }

    //Update user
    const updateUser = await this._userModel.updateOne({
      filter: { email },
      update: {
        confirmedAt: new Date(),
        $unset: { confirmEmailOTP: true, confirmEmailOTPExpiresAt: true },
      },
    });

    res.status(200).json({ message: "Email confirmed sucssefuly", updateUser });
  };

  //Login=========================================================
  login = async (req: Request, res: Response) => {
    const { email, password }: ILoginUpDTO = req.body;
    const checkUser = await this._userModel.findOne({
      filter: {
        email,
        confirmedAt: { $exists: true },
        confirmEmailOTP: { $exists: false },
      },
    });
    if (!checkUser)
      throw new NotFoundException("Email not confirmed or user not found");
    if (!(await compareHash(password, checkUser?.password as string))) {
      throw new BadRequestException("Invalid Password");
    }

    const Credentials = await createLoginCredentials(checkUser);

    res.status(200).json({ message: "Login successful", Credentials });
  };

  logout = async (req: Request, res: Response) => {
    await this._tokenModel.createTokenOut({
      data: [
        {
          jwtid: req.decoded?.jti,
          // expiresAt: new Date(req.decoded?.exp * 1000),
          userId: String(req.user?._id),
        },
      ],
    });

    res.status(200).json({ message: "Logout successful" });
  };

  refreshToken = async (req: Request, res: Response) => {
    if (!req.user) throw new NotFoundException("User not found");
    const credentials = await createLoginCredentials(req.user);
    res.status(200).json({
      message: "Token refreshed successfully",
      credentials,
    });
  };
}

export default new AuthentcationService();
