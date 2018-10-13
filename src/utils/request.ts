import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import consts from '@/configs/constants';
import api from '@/configs/apis';

function initAxios(): AxiosInstance {
  const axiosInstance: AxiosInstance = axios.create({
    baseURL: api.base,
    timeout: consts.requestTimeout,
  });
  axiosInstance.interceptors.request.use(function(config) {
    config.params = Object.assign({}, config.params, {
      _t: new Date().getTime(),
    });
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
 * @returns {Promise<ApiResponse<any>>}
 */
async function request(url: string, options: AxiosRequestConfig = {}): Promise<ApiResponse<any> > {
  const axiosInstance = initAxios();
  const response = await axiosInstance({
    url,
    ...options,
  });
  checkStatus(response);
  return response.data;
}

export function get(url: string): Promise<ApiResponse<any> > {
  return request(url);
}

export function post(url: string, data?: any): Promise<ApiResponse<any> > {
  return request(url, {
    method: 'post',
    data,
  });
}

export function put(url: string, data?: any): Promise<ApiResponse<any> > {
  return request(url, {
    method: 'put',
    data,
  });
}

export function patch(url: string, data?: any): Promise<ApiResponse<any> > {
  return request(url, {
    method: 'patch',
    data,
  });
}

export function del(url: string, data?: any): Promise<ApiResponse<any> > {
  return request(url, {
    method: 'delete',
    data,
  });
}

export default request;
