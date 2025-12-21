import { HydratedDocument, model, models, Schema } from "mongoose";

export interface IToken {
  _id: string;
  jwtid: string | undefined;
  userId: Schema.Types.ObjectId | string;
  expiresAt?: Date | number;
  createdAt: Date;
  updatedAt?: Date;
}

export const tokenSchema = new Schema<IToken>(
  {
    jwtid: {
      type: String || undefined,
    },
    expiresAt: {
      type: Date || Number,
    },
    userId: {
      type: Schema.Types.ObjectId || String,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const tokenModel = models.Token || model("Token", tokenSchema);
export type HTokenDoc = HydratedDocument<IToken>;
