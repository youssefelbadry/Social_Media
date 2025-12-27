import { userModel } from "./../../DB/Models/user.model";
import { sign, verify, Secret, SignOptions, JwtPayload } from "jsonwebtoken";
import { HUserDoc, Role } from "../../DB/Models/user.model";
import { v4 as uuid } from "uuid";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../Responsive/error.res";
import { userRepository } from "../../DB/Repository/user.repository";
import { TokenRepository } from "../../DB/Repository/token.repository";
import { TokenModel } from "../../DB/Models/token.model";

export enum signatureLevel {
  USER = "USER",
  ADMIN = "ADMIN",
}
export enum TokenTypeEnum {
  ACCESS = "ACCESS",
  REFRESH = "REFRESH",
}
export enum FlagEnum {
  ONLY = "ONLY",
  ALL = "ALL",
}
export const generateToken = async ({
  payload,
  secret,
  options,
}: {
  payload: object;
  secret: Secret;
  options: SignOptions;
}): Promise<string> => {
  return await sign(payload, secret, options);
};

export const virifyToken = async ({
  token,
  secret,
}: {
  token: string;
  secret: Secret;
  options?: SignOptions;
}): Promise<JwtPayload> => {
  return (await verify(token, secret)) as JwtPayload;
};

export const getSigentsureLevel = async (role: Role = Role.USER) => {
  let signatureLevelEnum: signatureLevel = signatureLevel.USER;
  return role === Role.ADMIN
    ? (signatureLevelEnum = signatureLevel.ADMIN)
    : (signatureLevelEnum = signatureLevel.USER);
};

export const getSigneture = async (
  signature: signatureLevel = signatureLevel.USER
): Promise<{ access_token: string; refresh_token: string }> => {
  let signatures: { access_token: string; refresh_token: string } = {
    access_token: "",
    refresh_token: "",
  };

  switch (signature) {
    case signatureLevel.ADMIN:
      signatures.access_token = process.env.ADMIN_ACCESS_TOKEN as string;
      signatures.refresh_token = process.env.ADMIN_REFRESH_TOKEN as string;

      break;
    case signatureLevel.USER:
      signatures.access_token = process.env.USER_ACCESS_TOKEN as string;
      signatures.refresh_token = process.env.USER_REFRESH_TOKEN as string;
      break;
    default:
      break;
  }

  return signatures;
};

export const createLoginCredentials = async (
  user: HUserDoc
): Promise<{ access_token: string; refresh_token: string }> => {
  const signatureLevelC = await getSigentsureLevel(user.role);
  const signature = await getSigneture(signatureLevelC);

  const jwtid = uuid();
  const access_token = await generateToken({
    payload: { _id: user._id, role: user.role },
    secret: signature.access_token,
    options: {
      expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRED),
      jwtid,
    },
  });

  const refresh_token = await generateToken({
    payload: { _id: user._id, role: user.role },
    secret: signature.refresh_token,
    options: {
      expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRED),
      jwtid,
    },
  });

  return { access_token, refresh_token };
};

export const decodedToken = async (
  authorization: string,
  tokenType: TokenTypeEnum = TokenTypeEnum.ACCESS
) => {
  const usermodel = new userRepository(userModel);
  const tokenModel = new TokenRepository(TokenModel);
  const [bearer, token] = authorization.split(" ");

  if (!bearer || !token) throw new UnauthorizedException("Missing Token parts");

  const signatures = await getSigneture(bearer as signatureLevel);

  const decoded = await virifyToken({
    token,
    secret:
      tokenType === TokenTypeEnum.REFRESH
        ? signatures.refresh_token
        : signatures.access_token,
  });

  if (!decoded?._id || !decoded.iat)
    throw new UnauthorizedException("Inavlid payloud token");

  if (await tokenModel.findOne({ filter: { jti: decoded.jti as string } }))
    throw new BadRequestException("Invalid or old login credentials");
  const user = await usermodel.findById({ id: decoded._id });
  if (!user) throw new NotFoundException("User not founded");

  if (user.changeCredientialTime?.getTime() || 0 > decoded.iat * 1000)
    throw new UnauthorizedException("Logout from all devices");

  return { user, decoded };
};

export const createRevokeToken = async (decoded: JwtPayload) => {
  const tokenModel = new TokenRepository(TokenModel);

  const [result] =
    (await tokenModel.create({
      data: [
        {
          jti: decoded.jti as string,
          expiresIn: decoded.iat as number,
          userId: decoded._id,
        },
      ],
    })) || [];

  return result;
};
