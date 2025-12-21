import { NextFunction, Request, Response } from "express";
import { Role } from "../DB/Models/user.model";
import { decodedToken, TokenTypeEnum } from "../Utils/Security/token";
import {
  BadRequestException,
  ForbiddenException,
} from "../Utils/Responsive/error.res";
import { tokenModel } from "../DB/Models/token.model";
import { TokenRepository } from "../DB/Repository/db.repository";

export class AuthenticationMiddleware {
  private _tokenRepo = new TokenRepository(tokenModel);
  constructor() {}

  authenticate(
    tokenType: TokenTypeEnum = TokenTypeEnum.ACCESS,
    accessRole: Role[] = []
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.headers.authorization) {
        throw new BadRequestException("Missing authorization header");
      }

      const { user, decoded } = await decodedToken(
        req.headers.authorization,
        tokenType
      );

      const isRevoked = await this._tokenRepo.findByJwtId(decoded.jti);

      if (isRevoked) {
        throw new ForbiddenException("Token revoked");
      }

      if (accessRole.length && !accessRole.includes(user.role)) {
        throw new ForbiddenException(
          "You are not authorized to access this resource"
        );
      }

      req.user = user;
      req.decoded = decoded;

      return next();
    };
  }
}
export default new AuthenticationMiddleware();
