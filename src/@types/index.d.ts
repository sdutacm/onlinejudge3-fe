declare interface ApiResponse<T> {
  success: boolean;
  code?: number;
  msg?: string;
  data?: T;
}

declare interface List<T> {
  page: number;
  count: number;
  limit: number;
  rows: T[];
}

declare interface FullList<T> {
  count: number;
  rows: T[];
}

declare interface ListQuery {
  page?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  limit?: number;
  [key: string]: any;
}

declare interface TypeObject<T> {
  [key: string]: T;
  [key: number]: T;
}

declare type Timestamp = number;
