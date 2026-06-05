import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import constants from '@/configs/constants';
import api from '@/configs/apis';
import { isBot } from '@/utils/userAgent';
import Cookies from 'js-cookie';
import { RequestError } from '@/lib/global/error';
import { getSSRRequestContext, isServerRuntime } from '@/utils/ssrRequestContext';
import { Codes } from '@/common/codes';

function initAxios(options: AxiosRequestConfig = {}): AxiosInstance {
  // On the server `api.base` is a host-less path; pull the absolute upstream
  // base (and any forwarded headers) from the current SSR request context.
  const ssrCtx = isServerRuntime ? getSSRRequestContext() : undefined;
  const axiosInstance: AxiosInstance = axios.create({
    baseURL: (ssrCtx && ssrCtx.apiBaseURL) || api.base,
    timeout: constants.requestTimeout,
    validateStatus: null,
    ...options,
  });
  axiosInstance.interceptors.request.use(function(config) {
    config.params = {
      ...config.params,
      // _t: new Date().getTime(),
    };
    return config;
  });
  return axiosInstance;
}

/**
 * Resolve the headers for a request, isomorphically.
 * - Browser: csrf token comes from the `csrfToken` cookie via js-cookie.
 * - Server: forward the incoming `Cookie` header and derive the csrf token from
 *   it (best-effort; anonymous first-paint requests may have none).
 */
function buildHeaders(options: AxiosRequestConfig): Record<string, string> {
  const headers: Record<string, string> = { ...(options.headers as any) };
  const method = (options.method || '').toLowerCase();
  const mutating = ['post', 'put', 'patch', 'delete'].includes(method);
  if (isServerRuntime) {
    const ssrCtx = getSSRRequestContext();
    if (ssrCtx) {
      if (ssrCtx.cookie) {
        headers['cookie'] = ssrCtx.cookie;
      }
      if (ssrCtx.headers) {
        Object.assign(headers, ssrCtx.headers);
      }
      if (mutating && ssrCtx.cookie) {
        const match = /(?:^|;\s*)csrfToken=([^;]+)/.exec(ssrCtx.cookie);
        if (match) {
          headers['x-csrf-token'] = decodeURIComponent(match[1]);
        }
      }
    }
  } else if (mutating) {
    headers['x-csrf-token'] = Cookies.get('csrfToken');
  }
  return headers;
}

function recordTimeDiff(response: AxiosResponse) {
  if (isServerRuntime) {
    return;
  }
  (window as any)._t_diff = Date.now() - new Date(response.headers.date).getTime();
}

function checkStatus(response: AxiosResponse) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  throw new RequestError(`Request failed with status code ${response.status}`, response);
}

function getFallbackCode(status: number) {
  switch (status) {
    case 401:
      return Codes.GENERAL_NOT_LOGGED_IN;
    case 403:
      return Codes.GENERAL_NO_PERMISSION;
    case 422:
      return Codes.GENERAL_REQUEST_PARAMS_ERROR;
    default:
      return status >= 500 ? Codes.GENERAL_INTERNAL_SERVER_ERROR : Codes.GENERAL_UNKNOWN_ERROR;
  }
}

function normalizeErrorResponse(response: AxiosResponse): IApiResponse<any> {
  const fallbackCode = getFallbackCode(response.status);
  const data = response.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return {
      ...data,
      success: false,
      code: data.code ?? fallbackCode,
    };
  }
  return {
    success: false,
    code: fallbackCode,
  };
}

/**
 * Send a request and get API response
 * @param {string} url
 * @param {AxiosRequestConfig} options
 * @param {AxiosRequestConfig} initOptions
 * @returns {Promise<IApiResponse<any>>}
 */
async function request(
  url: string,
  options: AxiosRequestConfig = {},
  initOptions: AxiosRequestConfig = {},
): Promise<IApiResponse<any>> {
  const axiosInstance = initAxios(initOptions);
  const headers = buildHeaders(options);
  const response = await axiosInstance({
    url,
    ...options,
    headers,
  });
  checkStatus(response);
  recordTimeDiff(response);
  if (response.status < 200 || response.status >= 300) {
    return normalizeErrorResponse(response);
  }
  return response.data;
}

/**
 * Send a request and get API response (with original original response object)
 * @param {string} url
 * @param {AxiosRequestConfig} options
 * @param {AxiosRequestConfig} initOptions
 * @returns {Promise<AxiosResponse<any>>}
 */
export async function originalRequest(
  url: string,
  options: AxiosRequestConfig = {},
  initOptions: AxiosRequestConfig = {},
): Promise<AxiosResponse<any>> {
  const axiosInstance = initAxios(initOptions);
  const headers = buildHeaders(options);
  const response = await axiosInstance({
    url,
    ...options,
    headers,
  });
  checkStatus(response);
  recordTimeDiff(response);
  return response;
}

export async function get<O = any>(url: string, minDuration?: number): Promise<IApiResponse<O>> {
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

export function post<I = any, O = any>(url: string, data?: I): Promise<IApiResponse<O>> {
  return request(url, {
    method: 'post',
    data,
  });
}

export function put<I = any, O = any>(url: string, data?: I): Promise<IApiResponse<O>> {
  return request(url, {
    method: 'put',
    data,
  });
}

export function patch<I = any, O = any>(url: string, data?: I): Promise<IApiResponse<O>> {
  return request(url, {
    method: 'patch',
    data,
  });
}

export function del<I = any, O = any>(url: string, data?: I): Promise<IApiResponse<O>> {
  return request(url, {
    method: 'delete',
    data,
  });
}

export default request;
