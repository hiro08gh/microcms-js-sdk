/**
 * microCMS API SDK
 * https://github.com/microcmsio/microcms-js-sdk
 */
import fetch from 'node-fetch';
import { parseQuery } from './utils/parseQuery';
import { isString } from './utils/isCheckValue';
import {
  MicroCMSClient,
  MakeRequest,
  GetRequest,
  GetListRequest,
  GetListDetailRequest,
  GetObjectRequest,
  MicroCMSListResponse,
  MicroCMSListContent,
  MicroCMSObjectContent,
} from './types';

const BASE_DOMAIN = 'microcms.io';
const API_VERSION = 'v1';

/**
 * Initialize SDK Client
 */
export const createClient = ({ serviceDomain, apiKey, globalDraftKey }: MicroCMSClient) => {
  if (!serviceDomain || !apiKey) {
    throw new Error('parameter is required (check serviceDomain and apiKey)');
  }

  if (!isString(serviceDomain) || !isString(apiKey)) {
    throw new Error('parameter is not string');
  }

  /**
   * Defined microCMS base URL
   */
  const baseUrl = `https://${serviceDomain}.${BASE_DOMAIN}/api/${API_VERSION}`;

  /**
   * Make request
   */
  const makeRequest = async <T>({
    endpoint,
    contentId,
    queries = {},
    useGlobalDraftKey = true,
  }: MakeRequest): Promise<T> => {
    const queryString = parseQuery(queries);

    const baseHeaders = {
      headers: { 'X-API-KEY': apiKey },
    };

    if (globalDraftKey && useGlobalDraftKey) {
      Object.assign(baseHeaders.headers, { 'X-GLOBAL-DRAFT-KEY': globalDraftKey });
    }

    const url = `${baseUrl}/${endpoint}${contentId ? `/${contentId}` : ''}${
      queryString ? `?${queryString}` : ''
    }`;

    try {
      const response = await fetch(url, baseHeaders);

      if (!response.ok) {
        throw new Error(`fetch API response status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error.data) {
        throw error.data;
      }

      if (error.response?.data) {
        throw error.response.data;
      }

      return Promise.reject(
        new Error(`serviceDomain or endpoint may be wrong.\n Details: ${error}`)
      );
    }
  };

  /**
   * Get list and object API data for microCMS
   */
  const get = async <T = any>({
    endpoint,
    contentId,
    queries = {},
    useGlobalDraftKey,
  }: GetRequest): Promise<T> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }
    return await makeRequest<T>({ endpoint, contentId, queries, useGlobalDraftKey });
  };

  /**
   * Get list API data for microCMS
   */
  const getList = async <T = any>({
    endpoint,
    queries = {},
    useGlobalDraftKey,
  }: GetListRequest): Promise<MicroCMSListResponse<T>> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }
    return await makeRequest<MicroCMSListResponse<T>>({ endpoint, queries, useGlobalDraftKey });
  };

  /**
   * Get list API detail data for microCMS
   */
  const getListDetail = async <T = any>({
    endpoint,
    contentId,
    queries = {},
    useGlobalDraftKey,
  }: GetListDetailRequest): Promise<T & MicroCMSListContent> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }
    return await makeRequest<T & MicroCMSListContent>({
      endpoint,
      contentId,
      queries,
      useGlobalDraftKey,
    });
  };

  /**
   * Get object API data for microCMS
   */
  const getObject = async <T = any>({
    endpoint,
    queries = {},
    useGlobalDraftKey,
  }: GetObjectRequest): Promise<T & MicroCMSObjectContent> => {
    if (!endpoint) {
      return Promise.reject(new Error('endpoint is required'));
    }
    return await makeRequest<T & MicroCMSObjectContent>({
      endpoint,
      queries,
      useGlobalDraftKey,
    });
  };

  return {
    get,
    getList,
    getListDetail,
    getObject,
  };
};
