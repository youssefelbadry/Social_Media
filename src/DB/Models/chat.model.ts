import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface IMessage {
  content: string[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IChat {
  participants: Types.ObjectId[];
  messages: Types.ObjectId[];

  group_name?: string;
  groups_image?: string;
  roomId?: string;

  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}
export const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: [String],
      required: true,
      trim: true,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const chatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    messages: [messageSchema],

    group_name: {
      type: String,
      trim: true,
    },

    groups_image: String,

    roomId: {
      type: String,
      unique: true,
      sparse: true,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
export const messageModel =
  models.Message || model<IMessage>("Message", messageSchema);

export type HMessageDoc = HydratedDocument<IMessage>;
export const chatModel = models.Chat || model<IChat>("Chat", chatSchema);

export type HChatDoc = HydratedDocument<IChat>;
