import * as z from "zod";
import {
  loginSchema,
  signUpSchema,
  confirmEmailSchema,
} from "./auth.validation";

export type ISignUpDTO = z.infer<typeof signUpSchema.body>;
export type ILoginUpDTO = z.infer<typeof loginSchema.body>;
export type IConfirmEmailDTO = z.infer<typeof confirmEmailSchema.body>;
