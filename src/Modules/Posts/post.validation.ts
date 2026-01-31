import * as z from "zod";

import { Types } from "mongoose";
import { generaFeild } from "../../Middlewares/validation.middlware";

export const createPostSchema = {
  body: z
    .strictObject({
      content: z.string().max(2000).optional(),

      allowedComment: z.enum(["ALLOW", "DENY"]).default("ALLOW"),

      availability: z.enum(["PUBLIC", "FRIENDS", "ONLY"]).default("PUBLIC"),

      tags: z
        .array(
          z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: "Invalid tag ObjectId",
          }),
        )
        .optional(),

      likes: z
        .array(
          z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: "Invalid like ObjectId",
          }),
        )
        .optional(),

      freezeBy: z
        .string()
        .refine((val) => Types.ObjectId.isValid(val), {
          message: "Invalid freezeBy ObjectId",
        })
        .optional(),

      freezeAt: z.date().optional(),

      restoreBy: z
        .string()
        .refine((val) => Types.ObjectId.isValid(val), {
          message: "Invalid restoreBy ObjectId",
        })
        .optional(),

      restoreAt: z.date().optional(),
      attachments: z.array(z.string().url()).optional(),

      // file: z.strictObject({}),
    })
    .superRefine((data, ctx) => {
      if (
        !data.content &&
        (!data.attachments || data.attachments.length === 0)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "Post must contain content or at least one attachment",
        });
      }

      if (data.freezeAt && !data.freezeBy) {
        ctx.addIssue({
          code: "custom",
          path: ["freezeBy"],
          message: "freezeBy is required if freezeAt exists",
        });
      }

      if (data.restoreAt && !data.restoreBy) {
        ctx.addIssue({
          code: "custom",
          path: ["restoreBy"],
          message: "restoreBy is required if restoreAt exists",
        });
      }

      if (
        data.tags?.length &&
        data.tags?.length !== [...new Set(data.tags)].length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["tags"],
          message: "Please choose unquie tags",
        });
      }
    }),
};
export const likePostSchema = {
  params: z.strictObject({
    postId: generaFeild.id,
  }),
};
