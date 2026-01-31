import * as z from "zod";

import { generaFeild } from "../../Middlewares/validation.middlware";

export const getChatSchema = {
  params: z.strictObject({
    userId: generaFeild.id,
  }),
};

export const sendMessageSchema = {
  params: z.strictObject({
    userId: generaFeild.id,
  }),
};

