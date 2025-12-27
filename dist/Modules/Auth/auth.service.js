"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = require("./../../Utils/Security/token");
const user_model_1 = require("./../../DB/Models/user.model");
const error_res_1 = require("../../Utils/Responsive/error.res");
const user_repository_1 = require("../../DB/Repository/user.repository");
const generateOtp_1 = require("../../Utils/Security/generateOtp");
const hash_1 = require("../../Utils/Security/hash");
const token_repository_1 = require("../../DB/Repository/token.repository");
const token_model_1 = require("../../DB/Models/token.model");
class AuthentcationService {
    _userModel = new user_repository_1.userRepository(user_model_1.userModel);
    _tokenModel = new token_repository_1.TokenRepository(token_model_1.TokenModel);
    constructor() { }
    signup = async (req, res) => {
        const { username, email, password, gender, phone } = req.body;
        const checkUser = await this._userModel.findOne({ filter: { email } });
        if (checkUser)
            throw new error_res_1.ConflictException("Email already exsist");
        const otp = generateOtp_1.Otp.generateOtp();
        const otpExpires = generateOtp_1.Otp.otpExpiresAt();
        const user = await this._userModel.createUser({
            data: [
                {
                    username,
                    email,
                    password: await (0, hash_1.generateHash)(password),
                    gender: gender,
                    phone,
                    confirmEmailOTP: await (0, hash_1.generateHash)(otp),
                    confirmEmailOTPExpiresAt: otpExpires,
                },
            ],
            options: { validateBeforeSave: true },
        });
        (0, generateOtp_1.emailService)(email, username, otp);
        res.status(201).json({
            message: "User created successfully, OTP sent to your email",
            user,
        });
    };
    requestConfirmEmail = async (req, res) => {
        const { email } = req.body;
        const checkUser = await this._userModel.findOne({
            filter: {
                email,
                confirmedAt: { $exists: false },
            },
        });
        if (!checkUser)
            throw new error_res_1.NotFoundException("User not founded or already confirmed");
        if (checkUser.confirmEmailOTPExpiresAt &&
            checkUser.confirmEmailOTPExpiresAt > new Date()) {
            throw new error_res_1.BadRequestException("OTP already sent, please wait");
        }
        const otp = generateOtp_1.Otp.generateOtp();
        const otpExpires = generateOtp_1.Otp.otpExpiresAt();
        const updateUser = await this._userModel.updateOne({
            filter: { email },
            update: {
                confirmEmailOTP: await (0, hash_1.generateHash)(otp),
                confirmEmailOTPExpiresAt: otpExpires,
            },
        });
        (0, generateOtp_1.emailService)(email, checkUser.username, otp);
        res.status(200).json({ message: "OTP is sent", updateUser });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const checkUser = await this._userModel.findOne({
            filter: {
                email,
                confirmEmailOTP: { $exists: true },
                confirmedAt: { $exists: false },
            },
        });
        if (!checkUser)
            throw new error_res_1.NotFoundException("User not founded");
        if (checkUser.confirmEmailOTPExpiresAt < new Date()) {
            throw new error_res_1.BadRequestException("OTP expired, please request a new one");
        }
        if (!(await (0, hash_1.compareHash)(otp, checkUser.confirmEmailOTP))) {
            throw new error_res_1.BadRequestException("Invalid OTP");
        }
        const updateUser = await this._userModel.updateOne({
            filter: { email },
            update: {
                confirmedAt: new Date(),
                $unset: { confirmEmailOTP: true, confirmEmailOTPExpiresAt: true },
            },
        });
        res.status(200).json({ message: "Email confirmed sucssefuly", updateUser });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const checkUser = await this._userModel.findOne({
            filter: {
                email,
                confirmedAt: { $exists: true },
                confirmEmailOTP: { $exists: false },
            },
        });
        if (!checkUser)
            throw new error_res_1.NotFoundException("Email not confirmed or user not found");
        if (!(await (0, hash_1.compareHash)(password, checkUser?.password))) {
            throw new error_res_1.BadRequestException("Invalid Password");
        }
        const Credentials = await (0, token_1.createLoginCredentials)(checkUser);
        res.status(200).json({ message: "Login successful", Credentials });
    };
    logout = async (req, res) => {
        const { flag } = req.body;
        let statusCode = 200;
        const update = {};
        switch (flag) {
            case token_1.FlagEnum.ONLY:
                await (0, token_1.createRevokeToken)(req.decoded);
                statusCode = 201;
                break;
            case token_1.FlagEnum.ALL:
                update.changeCredientialTime = new Date();
            default:
                break;
        }
        await this._userModel.updateOne({
            filter: {
                _id: req.decoded?._id,
            },
            update,
        });
        return res.status(statusCode).json({ message: "Done" });
    };
    refreshToken = async (req, res) => {
        if (!req.user)
            throw new error_res_1.NotFoundException("User not found");
        const credentials = await (0, token_1.createLoginCredentials)(req.user);
        res.status(200).json({
            message: "Token refreshed successfully",
            credentials,
        });
    };
}
exports.default = new AuthentcationService();
