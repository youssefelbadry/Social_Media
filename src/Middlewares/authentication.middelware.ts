import { NextFunction, Request, Response } from "express";
import {
  ReasonEnum,
  ReasonEnumAdmin,
  ReasonEnumUser,
  Role,
} from "../DB/Models/user.model";
import { decodedToken, TokenTypeEnum } from "../Utils/Security/token";
import {
  BadRequestException,
  ForbiddenException,
} from "../Utils/Responsive/error.res";
import { TokenModel } from "../DB/Models/token.model";
import { TokenRepository } from "../DB/Repository/token.repository";

export class AuthenticationMiddleware {
  private _tokenRepo = new TokenRepository(TokenModel);
  constructor() {}

  authenticate(
    tokenType: TokenTypeEnum = TokenTypeEnum.ACCESS,
    accessRole: Role[] = [],
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.headers.authorization) {
        throw new BadRequestException("Missing authorization header");
      }

      const { user, decoded } = await decodedToken(
        req.headers.authorization,
        tokenType,
      );

      if (!decoded.jti) {
        throw new BadRequestException("Invalid token: missing jti claim");
      }

      const isRevoked = await this._tokenRepo.findOne({
        filter: { jti: decoded.jti as string },
      });

      if (isRevoked) {
        throw new ForbiddenException("Token revoked");
      }

      if (accessRole.length && !accessRole.includes(user.role)) {
        throw new ForbiddenException(
          "You are not authorized to access this resource",
        );
      }

      if (user.freezeAt) {
        if (
          user.freezeReason !== ReasonEnum.USER_REQUEST &&
          user.role !== "ADMIN"
        ) {
          throw new ForbiddenException("Account frozen by moderation");
        }

        if (!req.path.includes("/restore")) {
          throw new ForbiddenException("Account frozen — Restore required");
        }
      }

      req.user = user;
      req.decoded = decoded;

      return next();
    };
  }
}
export default new AuthenticationMiddleware();
