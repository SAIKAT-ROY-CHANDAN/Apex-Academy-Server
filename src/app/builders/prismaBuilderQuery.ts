import { Prisma } from "../../../generated/prisma/client";

export interface QueryParams {
  searchTerm?: string;
  filter?: Record<string, any>;
  orderBy?: Record<string, any>;
  page?: string | number;
  limit?: string | number;
  academicSessionId?:string;
  class_id?: string;
  program_id?: string;
  department_id?: string;
}

export interface RelationSearchConfig {
  relation: string;
  fields: string[];
  /** Use `some` for one-to-many, `is` for one-to-one. Defaults to `some`. */
  mode?: 'some' | 'is';
}

export interface BuilderOptions {
  searchFields?: string[];
  relationSearch?: RelationSearchConfig[];
}

const safeParseJSON = (value: unknown, fallback: any) => {
  if(!value) return fallback;

  if(typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return fallback;
    }
  }
}

export const buildPrismaQuery = (query: QueryParams, options: BuilderOptions = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const take = limit;

  const parsedFilter = safeParseJSON(query.filter, {});
  const parsedOrderBy = safeParseJSON(query.orderBy, { created_at: 'desc' });
  
  const searchConditions: Prisma.Enumerable<any> = [];

  if (query.searchTerm) {
    const orConditions: any[] = [];

    if (options.searchFields?.length) {
      for (const field of options.searchFields) {
        orConditions.push({
          [field]: {
            contains: query.searchTerm,
            // mode: 'insensitive',
          },
        });
      }
    }

    if (options.relationSearch?.length) {
      for (const config of options.relationSearch) {
        if (!config.relation || !config.fields?.length) continue;
        const mode = config.mode ?? 'some';
        const nestedOr = config.fields.map((field) => ({
          [field]: {
            contains: query.searchTerm,
            // mode: 'insensitive',
          },
        }));
        orConditions.push({
          [config.relation]: { [mode]: { OR: nestedOr } },
        });
      }
    }

    if (orConditions.length > 0) {
      searchConditions.push({ OR: orConditions });
    }
  }

  const where = {
    ...parsedFilter,
    ...(searchConditions.length > 0 ? { AND: searchConditions } : {}),
  };

  return {
    skip,
    take,
    where,
    orderBy: parsedOrderBy,
    page,
  };
};

export const calculatePaginationMeta = (totalItems: number, page: number, limit: number) => {
  return {
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    limit,
  };
};
