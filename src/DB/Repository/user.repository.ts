import { CreateOptions, Model } from "mongoose";
import { IUser } from "../Models/user.model";
import { DataBaseRepository } from "./db.repository";
import { BadRequestException } from "../../Utils/Responsive/error.res";

export class userRepository extends DataBaseRepository<IUser> {
  constructor(protected override readonly model: Model<IUser>) {
    super(model);
  }

  async createUser({
    data = [],
    options = {},
  }: {
    data: Partial<IUser>[];
    options?: CreateOptions;
  }) {
    const [user] = (await this.create({ data, options })) || [];
    if (!user) throw new BadRequestException("Fail to signup");
    return user;
  }
}
