import * as http from 'http';
import * as https from 'https';
import * as Url from 'url';
import { Observable } from 'rxjs';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const libraryMap = {
  http: http,
  https: https
};

export const defaultHeaders = {
  'content-type': 'application/json'
};

export interface RequestArgsParams {
  host: string;
  path: string;
  method: string;
  data?: string;
  port?: number | string;
  customHeaders?: any;
}

/**
 *
 * @param host
 * @param path
 * @param method
 * @param data
 * @param customHeaders
 */
export function generateRequestArgs(
  config: RequestArgsParams
): http.ClientRequestArgs {
  const headers = config.customHeaders || defaultHeaders;
  if (config.data) {
    headers['content-length'] = Buffer.byteLength(config.data);
  }

  const clientRequestArgs: http.ClientRequestArgs = {
    host: config.host,
    path: config.path,
    method: config.method,
    headers: headers
  };

  if (config.port) {
    clientRequestArgs.port = config.port;
  }

  return clientRequestArgs;
}

/**
 *
 * @param method
 * @param url
 * @param data
 * @param headers
 */
export function request(
  method: HttpMethod,
  url: string,
  data?: any,
  headers?: any
): Observable<any> {
  return new Observable(observer => {
    const parsedUrl = Url.parse(url);
    parsedUrl.protocol = parsedUrl.protocol.slice(
      0,
      parsedUrl.protocol.length - 1
    );
    if (data) {
      data = JSON.stringify(data);
    }

    const argsConfig: RequestArgsParams = {
      host: parsedUrl.host,
      path: parsedUrl.path,
      method: method
    };

    if (data) {
      argsConfig.data = data;
    }

    if (headers) {
      argsConfig.customHeaders = headers;
    }

    if (parsedUrl.port) {
      argsConfig.port = parsedUrl.port;
    }
    const requestArguments = generateRequestArgs(argsConfig);

    const req = libraryMap[parsedUrl.protocol].request(
      requestArguments,
      (res: http.IncomingMessage) => {
        res.setEncoding('utf8');

        let body = '';
        res.on('data', chunk => {
          body += chunk;
        });

        res.on('end', () => {
          observer.next(body);
          observer.complete();
        });
      }
    );

    req.on('error', (err: any) => {
      observer.error(err);
      observer.complete();
    });

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

/**
 *
 */
export class RequestObservables {
  static get(url: string, data?: any, headers?: any): Observable<any> {
    return request('GET', url, data, headers);
  }

  static post(url: string, data?: any, headers?: any): Observable<any> {
    return request('POST', url, data, headers);
  }

  static put(url: string, data?: any, headers?: any): Observable<any> {
    return request('PUT', url, data, headers);
  }

  static delete(url: string, data?: any, headers?: any): Observable<any> {
    return request('DELETE', url, data, headers);
  }
}
