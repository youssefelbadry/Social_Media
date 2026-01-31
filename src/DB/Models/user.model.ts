import { HydratedDocument, model, models, Schema, Types } from "mongoose";
// import { BadRequestException } from "../../Utils/Responsive/error.res";
// import { NextFunction } from "express";
// import { generateHash } from "../../Utils/Security/hash";
// import { emailEvent } from "../../Utils/Events/email.event";

export enum GenderEnum {
  MALE = "MALE",
  FEMALE = "FEMALE",
}
export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}
export enum ReasonEnumAdmin {
  SPAM = "SPAM",
  HARASSMENT = "HARASSMENT",
  HATE_SPEECH = "HATE_SPEECH",
  NUDITY = "NUDITY",
  SCAM = "SCAM",
  ADMIN_ACTION = "ADMIN_ACTION",
  includes = "includes",
}

export enum ReasonEnumUser {
  USER_REQUEST = "USER_REQUEST",
}
export enum ReasonEnum {
  SPAM = "SPAM",
  HARASSMENT = "HARASSMENT",
  HATE_SPEECH = "HATE_SPEECH",
  NUDITY = "NUDITY",
  SCAM = "SCAM",
  ADMIN_ACTION = "ADMIN_ACTION",
  USER_REQUEST = "USER_REQUEST",
  includes = "includes",
}
export interface IUser {
  _id: Types.ObjectId;

  firstName: string;
  lastName: string;
  username: string;
  slug: string;

  email: string;
  confirmEmailOTP?: string;
  confirmedAt?: Date;
  confirmEmailOTPExpiresAt?: Date;
  changeCredientialTime: Date;

  password: string;
  resetPasswordOTP?: string;

  phone: string;
  address?: string;
  prifileImage?: string;
  gender: GenderEnum;
  role: Role;

  followers?: Types.ObjectId[];
  following?: Types.ObjectId[];

  friends?: Types.ObjectId[];

  freezeBy?: Types.ObjectId[];
  freezeAt?: Date;
  freezeReason?: ReasonEnum;

  restoredBy?: Types.ObjectId[];
  restoredAt?: Date;

  createdAt: Date;
  updatedAt?: Date;
  otp?: string;
}

export const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
    },
    slug: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [5, "Last name must be at least 2 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^01[0-2,5]{1}[0-9]{8}$/,
        "Please enter a valid Egyptian phone number",
      ],
    },

    address: {
      type: String,
    },

    gender: {
      type: String,
      enum: {
        values: Object.values(GenderEnum),
        message: "Gender must be MALE or FEMALE",
      },
      required: [true, "Gender is required"],
    },
    prifileImage: String,
    role: {
      type: String,
      enum: {
        values: Object.values(Role),
        message: "Role must be USER or ADMIN",
      },
      default: Role.USER,
    },

    followers: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    friends: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],

    freezeBy: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],

    freezeAt: {
      type: Date,
    },

    freezeReason: {
      type: String,
      enum: Object.values(ReasonEnum),
    },

    restoredBy: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],

    restoredAt: {
      type: Date,
    },

    confirmEmailOTP: {
      type: String,
    },
    confirmEmailOTPExpiresAt: {
      type: Date,
    },

    resetPasswordOTP: {
      type: String,
    },

    confirmedAt: {
      type: Date,
    },
    changeCredientialTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema
  .virtual("username")
  .set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName, slug: value.replaceAll(/\s+/g, "-") });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

export const userModel = models.user || model("User", userSchema);
export type HUserDoc = HydratedDocument<IUser>;
