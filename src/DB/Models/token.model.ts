import { HydratedDocument, model, models, Schema } from "mongoose";

export interface IToken {
  jti: string;
  userId: Schema.Types.ObjectId | string;
  expiresIn?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export const tokenSchema = new Schema<IToken>(
  {
    jti: {
      type: String,
    },
    expiresIn: {
      type: Number,
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

export const TokenModel = models.Token || model("Token", tokenSchema);
export type HTokenDoc = HydratedDocument<IToken>;
