import {
  CreateOptions,
  HydratedDocument,
  Model,
  MongooseUpdateQueryOptions,
  PopulateOptions,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  UpdateQuery,
} from "mongoose";
import { IToken } from "../Models/token.model";

export abstract class DataBaseRepository<TModel> {
  constructor(protected readonly model: Model<TModel>) {}

  async create({
    data,
    options,
  }: {
    data: Partial<TModel>[];
    options?: CreateOptions;
  }): Promise<HydratedDocument<TModel>[]> {
    return await this.model.create(data as any, options);
  }

  async findOne({
    filter,
    select,
    options,
  }: {
    filter?: QueryFilter<TModel>;
    select?: ProjectionType<TModel> | null;
    options?: QueryOptions<TModel> | null;
  }) {
    const doc = this.model.findOne(filter).select(select || "");
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }
    return await doc.exec();
  }
  async findById({
    id,
    select,
    options,
  }: {
    id?: any;
    select?: ProjectionType<TModel> | null;
    options?: QueryOptions<TModel> | null;
  }) {
    const doc = this.model.findById(id).select(select || "");
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }
    return await doc.exec();
  }

  async updateOne({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TModel>;
    update: UpdateQuery<TModel> | null;
    options?: MongooseUpdateQueryOptions<TModel> | null;
  }) {
    return await this.model.updateOne(
      filter,
      { ...update, $inc: { _v: 1 } },
      options
    );
  }
}
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
  async findByJwtId(jwtid: any) {
    return await this.model.findOne({ jwtid });
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
