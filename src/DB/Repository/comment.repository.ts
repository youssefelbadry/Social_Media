import { CreateOptions, Model } from "mongoose";
import { DataBaseRepository } from "./db.repository";
import { BadRequestException } from "../../Utils/Responsive/error.res";
import { IComment } from "../Models/comment.model";

export class commentRepository extends DataBaseRepository<IComment> {
  constructor(protected override readonly model: Model<IComment>) {
    super(model);
  }

  async createComment({
    data = [],
    options = {},
  }: {
    data: Partial<IComment>[];
    options?: CreateOptions;
  }) {
    const [post] = (await this.create({ data, options })) || [];
    if (!post) throw new BadRequestException("Fail to create post");
    return post;
  }
}
