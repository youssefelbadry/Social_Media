import * as z from "zod";
import { generaFeild } from "../../Middlewares/validation.middlware";
export const loginSchema = {
  body: z.strictObject({
    email: generaFeild.email,
    password: generaFeild.password,
  }),
};
export const signUpSchema = {
  body: loginSchema.body
    .extend({
      username: generaFeild.username,
      confirmPassword: generaFeild.confirmPassword,
      gender: generaFeild.gender,
      phone: generaFeild.phone,
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Password Missmatch",
        });
      }
      if (data.username?.split(" ").length != 2) {
        ctx.addIssue({
          code: "custom",
          path: ["username"],
          message: "Username must be 2 words",
        });
      }
    }),
};

export const confirmEmailSchema = {
  body: z.strictObject({
    email: generaFeild.email,
    otp: generaFeild.otp,
  }),
};

export const requestOtpSchema = {
  body: z.strictObject({
    email: generaFeild.email,
  }),
};
