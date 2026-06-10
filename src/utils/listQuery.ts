import { isEqual } from 'lodash-es';
import { isStateExpired } from '@/utils/misc';

/**
 * Format list query, and only reserve valid property.
 */
export function formatListQuery(query: IListQuery = {}, ignorePagination = false): IListQuery {
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

function toNumberIfPresent(query: IListQuery, key: string) {
  const value = query[key];
  if (value !== undefined && value !== null && value !== '') {
    query[key] = +value;
  }
}

export function normalizeProblemListQuery(query: IListQuery = {}): IListQuery {
  const normalizedQuery = { ...query };
  if (normalizedQuery.author) {
    normalizedQuery.authors = [normalizedQuery.author];
    delete normalizedQuery.author;
  }
  if (normalizedQuery.tagIds && typeof normalizedQuery.tagIds === 'string') {
    normalizedQuery.tagIds = [normalizedQuery.tagIds];
  }
  if (normalizedQuery.tagIds && Array.isArray(normalizedQuery.tagIds)) {
    normalizedQuery.tagIds = normalizedQuery.tagIds.map((tagId) => +tagId);
  }
  return formatListQuery(normalizedQuery);
}

export function normalizeContestListQuery(query: IListQuery = {}): IListQuery {
  const formattedQuery: IListQuery = {
    ...formatListQuery(query),
    order: [['contestId', 'DESC']],
  };
  toNumberIfPresent(formattedQuery, 'contestId');
  toNumberIfPresent(formattedQuery, 'type');
  toNumberIfPresent(formattedQuery, 'category');
  toNumberIfPresent(formattedQuery, 'mode');
  return formattedQuery;
}

export function normalizePostListQuery(query: IListQuery = {}): IListQuery {
  return {
    ...formatListQuery(query),
    order: [['postId', 'DESC']],
  };
}

export function normalizeSetListQuery(query: IListQuery = {}): IListQuery {
  return {
    ...formatListQuery(query),
    order: [['setId', 'DESC']],
  };
}

export function normalizeCompetitionListQuery(query: IListQuery = {}): IListQuery {
  return {
    ...formatListQuery(query),
    order: [['competitionId', 'DESC']],
  };
}

export function normalizeUserListQuery(query: IListQuery = {}): IListQuery {
  const formattedQuery: IListQuery = {
    ...formatListQuery(query),
    order: [
      [
        query.orderBy || 'accepted',
        query.orderDirection ? (query.orderDirection === 'DESC' ? 'DESC' : 'ASC') : 'DESC',
      ],
    ],
  };
  delete formattedQuery.orderBy;
  delete formattedQuery.orderDirection;
  return formattedQuery;
}

export function hasFreshListDataForQuery(listState: any, expectedQuery: IListQuery): boolean {
  return !!listState && !isStateExpired(listState) && isEqual(listState._query, expectedQuery);
}

export function shouldShowListLoadingForQuery(
  loading: boolean,
  listState: any,
  expectedQuery: IListQuery,
): boolean {
  return !!loading && !hasFreshListDataForQuery(listState, expectedQuery);
}
