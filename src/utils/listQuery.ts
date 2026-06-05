/**
 * Format list query, and only reserve valid property.
 */
export function formatListQuery(query: IListQuery, ignorePagination = false): IListQuery {
  const formattedQuery: IListQuery = ignorePagination ? { ...query } : {
    ...query,
    page: +query.page || 1,
  };
  query.limit && (formattedQuery.limit = +query.limit);
  for (const q in formattedQuery) {
    if (formattedQuery.hasOwnProperty(q) && !formattedQuery[q] && formattedQuery[q] !== false) {
      delete formattedQuery[q];
    }
  }
  return formattedQuery;
}
