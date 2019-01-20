declare interface IApiResponse<T> {
  success: boolean;
  code?: number;
  msg?: string;
  data?: T;
}

declare interface IList<T> {
  page: number;
  count: number;
  limit: number;
  rows: T[];
}

declare interface IFullList<T> {
  count: number;
  rows: T[];
}

declare interface IListQuery {
  page?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  limit?: number;
  [key: string]: any;
}

declare interface ITypeObject<T> {
  [key: string]: T;
  [key: number]: T;
}

declare type ITimestamp = number;
