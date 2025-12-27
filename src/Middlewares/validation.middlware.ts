import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import * as z from "zod";
import { BadRequestException } from "../Utils/Responsive/error.res";
import { FlagEnum } from "../Utils/Security/token";
type keyReqType = keyof Request;
type SchemaType = Partial<Record<keyReqType, ZodType>>;
export const validation = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction): NextFunction => {
    const validtaionErrors: Array<{
      key: keyReqType;
      issues: Array<{ message: string; path: (string | number | symbol)[] }>;
    }> = [];
    for (const key of Object.keys(schema) as keyReqType[]) {
      if (!schema[key]) continue;

      const validationResults = schema[key].safeParse(req[key]);
      if (!validationResults.success) {
        const errors = validationResults.error as ZodError;
        validtaionErrors.push({
          key,
          issues: errors.issues.map((issue) => {
            return { message: issue.message, path: issue.path };
          }),
        });
      }

      if (validtaionErrors.length > 0) {
        throw new BadRequestException("Validation Error", {
          cause: validtaionErrors,
        });
      }
    }
    return next() as unknown as NextFunction;
  };
};

export const generaFeild = {
  username: z
    .string()
    .min(3, { error: "Username must be at leasat 3 cahracter long" })
    .max(30, { error: "Username must be at leasat 30 cahracter long" }),
  email: z.email(),
  password: z.string(),
  confirmPassword: z.string(),
  gender: z.string(),
  phone: z.string(),
  otp: z.string(),
  flag: z.enum(FlagEnum).default(FlagEnum.ONLY),
};
