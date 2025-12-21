import { HUserDoc } from "../../DB/Models/user.model";
import { JwtPayload } from "jsonwebtoken";
declare module "express-serve-static-core" {
  interface Request {
    user?: HUserDoc;
    decoded?: JwtPayload;
  }
}
