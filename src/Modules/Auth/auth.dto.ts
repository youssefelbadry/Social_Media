import * as z from "zod";
import {
  loginSchema,
  signUpSchema,
  confirmEmailSchema,
  logOutSchema,
} from "./auth.validation";

export type ISignUpDTO = z.infer<typeof signUpSchema.body>;
export type ILoginUpDTO = z.infer<typeof loginSchema.body>;
export type IConfirmEmailDTO = z.infer<typeof confirmEmailSchema.body>;
export type IlogoutDTO = z.infer<typeof logOutSchema.body>;
