import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import constants from '@/configs/constants';
import api from '@/configs/apis';
import { isBot } from '@/utils/userAgent';

function initAxios(options: AxiosRequestConfig = {}): AxiosInstance {
  const axiosInstance: AxiosInstance = axios.create({
    baseURL: api.base,
    timeout: constants.requestTimeout,
    ...options,
  });
  axiosInstance.interceptors.request.use(function(config) {
    config.params = {
      ...config.params,
      _t: new Date().getTime(),
    };
    return config;
  });
  return axiosInstance;
}

function checkStatus(response: AxiosResponse) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error: any = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Send a request and get API response
 * @param {string} url
 * @param {AxiosRequestConfig} options
 * @returns {Promise<IApiResponse<any>>}
 */
async function request(url: string, options: AxiosRequestConfig = {}, initOptions: AxiosRequestConfig = {}): Promise<IApiResponse<any> > {
  const axiosInstance = initAxios(initOptions);
  const response = await axiosInstance({
    url,
    ...options,
  });
  checkStatus(response);
  (window as any)._t_diff = Date.now() - new Date(response.headers.date).getTime();
  return response.data;
}

export async function get(url: string, minDuration?: number): Promise<IApiResponse<any> > {
  const startTime = Date.now();
  const res = await request(url);
  if (!isBot() && minDuration > 0) {
    const duration = Date.now() - startTime;
    if (duration < minDuration) {
      return new Promise<IApiResponse<any>>((resolve, reject) => {
        setTimeout(() => resolve(res), minDuration - duration);
      });
    }
  }
  return res;
}

export function post(url: string, data?: any): Promise<IApiResponse<any> > {
  return request(url, {
    method: 'post',
    data,
  });
}

export function put(url: string, data?: any): Promise<IApiResponse<any> > {
  return request(url, {
    method: 'put',
    data,
  });
}

export function patch(url: string, data?: any): Promise<IApiResponse<any> > {
  return request(url, {
    method: 'patch',
    data,
  });
}

export function del(url: string, data?: any): Promise<IApiResponse<any> > {
  return request(url, {
    method: 'delete',
    data,
  });
}

export default request;
