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
