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
  async find({
    filter,
    select,
    options,
  }: {
    filter?: QueryFilter<TModel>;
    select?: ProjectionType<TModel> | null;
    options?: QueryOptions<TModel> | null;
  }) {
    const doc = this.model.find(filter).select(select || "");
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }
    return await doc.exec();
  }
  async pagination({
    filter = {},
    options = {},
    select = {},
    page = 1,
    size = 5,
  }: {
    filter?: QueryFilter<TModel>;
    select?: ProjectionType<TModel> | null;
    options?: QueryOptions<TModel> | null;
    page: number;
    size: number;
  }) {
    let docsCount: number | undefined = undefined;
    let pages: number | undefined = undefined;
    options = options || {};

    page = Math.floor(page < 1 ? 1 : page);
    options.limit = Math.floor(size < 1 || !size ? 5 : size);
    options.skip = (page - 1) * options?.limit;
    docsCount = await this.model.countDocuments(filter);
    pages = Math.ceil(docsCount / options?.limit);

    const results = await this.find({ filter, select, options });

    return {
      page,
      size,
      docsCount,
      pages,
      results,
    };
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
      options,
    );
  }

  async findOneAndUpdate({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TModel>;
    update: UpdateQuery<TModel> | null;
    options?: QueryOptions<TModel> | null;
  }) {
    return await this.model.findOneAndUpdate(
      filter,
      { ...update, $inc: { _v: 1 } },
      { new: true, ...options },
    );
  }

  async hardDelete({ id }: { id: string }) {
    return await this.model.findByIdAndDelete(id);
  }
}
