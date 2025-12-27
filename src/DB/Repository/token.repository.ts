import { DataBaseRepository } from "./db.repository"; // adjust path as needed
import { IToken } from "../Models/token.model";
import { Model } from "mongoose";
import {
  CreateOptions,
  QueryOptions,
  ProjectionType,
  PopulateOptions,
} from "mongoose";

export class TokenRepository extends DataBaseRepository<IToken> {
  constructor(protected override readonly model: Model<IToken>) {
    super(model);
  }

  async createTokenOut({
    data,
    options,
  }: {
    data: Partial<IToken>[];
    options?: CreateOptions;
  }): Promise<IToken[]> {
    return await this.model.create(data as any, options);
  }
  async findByJwtId(id: string) {
    return await this.model.findById({ id });
  }

  async findTokenById({
    jwtid,
    select,
    options,
  }: {
    jwtid?: any;
    select?: ProjectionType<IToken> | null;
    options?: QueryOptions<IToken> | null;
  }) {
    const doc = this.model.findById(jwtid).select(select || "");
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }
    return await doc.exec();
  }
}
