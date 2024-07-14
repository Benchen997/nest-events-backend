import { SelectQueryBuilder } from 'typeorm';

export interface PaginateOptions {
  // the number of items per page
  limit: number;
  // the current page number
  currentPage: number;
  // a boolean indicating whether to calculate the total number
  // of items
  total?: boolean;
}

export interface PaginationResult<T> {
  // the index of first item on the current page
  first: number;
  // the index of the last item on the current page
  last: number;
  // the number of items per page
  limit: number;
  // the total number of items(if required).
  total?: number;
  // an array containing the items for the current page
  data: T[];
}

/*
 * @function: paginate
 * @description: This function is used to paginate the results of a query.
 * @param {SelectQueryBuilder<T>} qb: The query builder object.
 * @param {PaginateOptions} options: The pagination options.
 * @returns {Promise<PaginationResult<T>>}: The paginated results.
 * @example
 * const data = await qb.limit(10).offset(0).getMany();
 * const result = await paginate(qb, { limit: 10, currentPage: 1 });
 * console.log(result);
 * Output: {
 *    first: 1,
 *    last: 10,
 *    limit: 10,
 *    total: 100,
 *    data: [...]
 *  }
 *
 * */
export async function paginate<T>(
  qb: SelectQueryBuilder<T>,
  options: PaginateOptions = {
    limit: 10,
    currentPage: 1,
  },
): Promise<PaginationResult<T>> {
  const offset = (options.currentPage - 1) * options.limit;
  const data = await qb.limit(options.limit).offset(offset).getMany();
  return {
    first: offset + 1,
    last: offset + data.length,
    limit: options.limit,
    total: options.total ? await qb.getCount() : null,
    data,
  };
}
