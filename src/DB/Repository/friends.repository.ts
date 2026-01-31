import { CreateOptions, Model } from "mongoose";
import { DataBaseRepository } from "./db.repository";
import { BadRequestException } from "../../Utils/Responsive/error.res";
import { IFriends } from "../Models/friendReq.model";

export class FriendsRepository extends DataBaseRepository<IFriends> {
  constructor(protected override readonly model: Model<IFriends>) {
    super(model);
  }

  async createFriends({
    data = [],
    options = {},
  }: {
    data: Partial<IFriends>[];
    options?: CreateOptions;
  }) {
    const [addfriend] = (await this.create({ data, options })) || [];
    if (!addfriend) throw new BadRequestException("Fail to send add friend");
    return addfriend;
  }
}
