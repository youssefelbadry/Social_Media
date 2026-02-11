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
export const createGroubSchema = {
  body: z
    .strictObject({
      participants: z.array(generaFeild.id).min(2, {
        message: "Group must contain at least 3 members",
      }),
      group: z.string().min(1).max(100),
    })
    .superRefine((data, ctx) => {
      if (data.participants.length !== new Set(data.participants).size) {
        ctx.addIssue({
          code: "custom",
          path: ["participants"],
          message: "Please choose unique participants",
        });
      }
    }),
};

export const getGroupSchema = {
  params: z.strictObject({
    groupId: generaFeild.id,
  }),
};
