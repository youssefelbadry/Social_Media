import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export enum FriendStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  BLOCKED = "BLOCKED",
}
export interface IFriends {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;

  status: FriendStatus;

  acceptedAt?: Date;
  blockedAt?: Date;
}

export const friendsSchema = new Schema<IFriends>(
  {
    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(FriendStatus),
      default: FriendStatus.PENDING,
    },

    acceptedAt: Date,
    blockedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const friendsModel = models.Friends || model("Friends", friendsSchema);
export type HFriendsDoc = HydratedDocument<IFriends>;
