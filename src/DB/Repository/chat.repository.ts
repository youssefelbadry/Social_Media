import { Model } from "mongoose";
import { DataBaseRepository } from "./db.repository";
// import { BadRequestException } from "../../Utils/Responsive/error.res";
// import { IComment } from "../Models/comment.model";
import { IChat } from "../Models/chat.model";

export class chatRepository extends DataBaseRepository<IChat> {
  constructor(protected override readonly model: Model<IChat>) {
    super(model);
  }

  //   async createChat({
  //     data = [],
  //     options = {},
  //   }: {
  //     data: Partial<IChat>[];
  //     options?: CreateOptions;
  //   }) {
  //     const [post] = (await this.create({ data, options })) || [];
  //     if (!post) throw new BadRequestException("Fail to create post");
  //     return post;
  //   }
}
