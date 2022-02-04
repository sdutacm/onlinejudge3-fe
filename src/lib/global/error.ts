import { AxiosResponse } from 'axios';
import api from '@/configs/apis';

/**
 * 非业务请求错误对象。
 */
export class RequestError extends Error {
  response: AxiosResponse;
  apiName: string;
  status: number;
  data: any;

  /**
   * 抛出请求错误。
   */
  constructor(message: string, response?: AxiosResponse) {
    super(message);
    this.name = 'RequestError';
    this.response = response;
    const originalUrl = (response as AxiosResponse)?.config?.url || '';
    this.apiName = originalUrl.replace(api.base, '').substr(1);
    this.status = response?.status;
    this.data = response?.data;
    Error.captureStackTrace(this, Error); // no stack to prevent React dev panel catch it
  }
}
