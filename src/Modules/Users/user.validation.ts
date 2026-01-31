import * as z from "zod";
import { generaFeild } from "../../Middlewares/validation.middlware";

export const followSchema = {
  params: z.strictObject({
    userId: generaFeild.id,
  }),
};

export const friendSchema = {
  params: z.strictObject({
    userId: generaFeild.id,
  }),
};

export const acceptfriendSchema = {
  params: z.strictObject({
    reqId: generaFeild.id,
  }),
};
