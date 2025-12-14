import * as z from "zod";
import { loginSchema, signUpSchema } from "./auth.validation";

export type ISignUpDTO = z.infer<typeof signUpSchema.body>;
export type ILoginUpDTO = z.infer<typeof loginSchema.body>;
