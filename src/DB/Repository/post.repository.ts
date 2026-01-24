import { CreateOptions, Model } from "mongoose";
import { IPost } from "../Models/post.model";
import { DataBaseRepository } from "./db.repository";
import { BadRequestException } from "../../Utils/Responsive/error.res";

export class postRepository extends DataBaseRepository<IPost> {
  constructor(protected override readonly model: Model<IPost>) {
    super(model);
  }

  async createPost({
    data = [],
    options = {},
  }: {
    data: Partial<IPost>[];
    options?: CreateOptions;
  }) {
    const [post] = (await this.create({ data, options })) || [];
    if (!post) throw new BadRequestException("Fail to create post");
    return post;
  }
}
