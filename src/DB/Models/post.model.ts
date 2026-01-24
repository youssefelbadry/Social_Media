import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export enum AlLowedComments {
  ALLOW = "ALLOW",
  DENTY = "DENTY ",
}
export enum Avaibility {
  PUBLIC = "PUBLIC",
  FRIENDS = "FRIENDS",
  ONLY = "ONLY",
}

export enum AllowedComments {
  ALLOW = "ALLOW",
  DENY = "DENY",
}
export enum LikesUNLikes {
  LIKE = "LIKE",
  UNLIKE = "UNLIKE",
}

export interface IPost {
  content?: string;
  attachments?: string[];
  allowedComment: AllowedComments;
  availability: Avaibility;
  assitFolderId: string;

  tags?: Types.ObjectId[];
  likes?: Types.ObjectId[];

  createdBy: Types.ObjectId;

  freezeBy?: Types.ObjectId;
  freezeAt?: Date;

  restoreBy?: Types.ObjectId;
  restoreAt?: Date;
}

export const postSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      trim: true,
      maxlength: 50000,
      required: function () {
        return !this.attachments?.length;
      },
    },

    attachments: [
      {
        type: String,
      },
    ],

    allowedComment: {
      type: String,
      enum: Object.values(AllowedComments),
      default: AllowedComments.ALLOW,
    },

    availability: {
      type: String,
      enum: Object.values(Avaibility),
      default: Avaibility.PUBLIC,
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
      },
    ],

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      // required: true,
    },

    freezeBy: {
      type: Types.ObjectId,
      ref: "User",
    },

    freezeAt: {
      type: Date,
    },

    restoreBy: {
      type: Types.ObjectId,
      ref: "User",
    },

    restoreAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const postModel = models.post || model("Post", postSchema);
export type HPostDoc = HydratedDocument<IPost>;
