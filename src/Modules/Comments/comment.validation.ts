import * as z from "zod";
import { Types } from "mongoose";
import { generaFeild } from "../../Middlewares/validation.middlware";

export const createCommentSchema = {
  params: z.strictObject({
    postId: generaFeild.id,
  }),

  body: z
    .strictObject({
      content: z.string().max(50000).optional(),

      attachments: z.array(z.string().url()).optional(),

      tags: z
        .array(
          z.string().refine((val) => Types.ObjectId.isValid(val), {
            message: "Invalid tag ObjectId",
          }),
        )
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.content && !data.attachments?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "Comment must contain content or attachment",
        });
      }

      if (
        data.tags?.length &&
        data.tags?.length !== [...new Set(data.tags)].length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["tags"],
          message: "Tags must be unique",
        });
      }
    }),
};
export const likeCommentSchema = {
  params: z.strictObject({
    commentId: generaFeild.id,
    postId: generaFeild.id,
  }),
};
