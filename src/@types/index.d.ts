interface IApiResponse<T = undefined> {
  success: boolean;
  code?: number;
  msg?: string;
  data?: T;
}

interface IList<T> {
  page: number;
  count: number;
  limit: number;
  rows: T[];
}

interface IFullList<T> {
  count: number;
  rows: T[];
}

interface IListQuery {
  page?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  limit?: number;
  [key: string]: any;
}

interface ITypeObject<T> {
  [key: string]: T;
  [key: number]: T;
}

type ITimestamp = number;
