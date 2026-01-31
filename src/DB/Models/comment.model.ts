import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export enum LikesUNLikes {
  LIKE = "LIKE",
  UNLIKE = "UNLIKE",
}

export interface IComment {
  content?: string;
  attachments?: string[];
  assitFolderId?: string;

  postId: Types.ObjectId;
  createdBy: Types.ObjectId;

  tags?: Types.ObjectId[];
  likes?: Types.ObjectId[];

  freezeBy?: Types.ObjectId;
  freezeAt?: Date;

  deletedBy?: Types.ObjectId[];
  deletedAt?: Date | Number | any;

  restoreBy?: Types.ObjectId;
  restoreAt?: Date;
}

export const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      trim: true,
      maxlength: 50000,
      required: function () {
        return !this.attachments?.length;
      },
    },

    attachments: {
      type: [String],
      default: [],
    },

    assitFolderId: { type: String },

    tags: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],

    likes: [
      {
        type: Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    postId: {
      type: Types.ObjectId,
      ref: "Post",
      required: true,
    },

    freezeBy: {
      type: Types.ObjectId,
      ref: "User",
    },

    freezeAt: { type: Date },

    restoreBy: {
      type: Types.ObjectId,
      ref: "User",
    },

    restoreAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const commentModel = models.Comment || model("Comment", commentSchema);
export type HCommentDoc = HydratedDocument<IComment>;
