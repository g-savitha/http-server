export type HttpRequest = {
  method: string;
  path: string;
  headers: Record<string, string>;
  body: string;
}

export type HttpResponse = {
  statusCode: number;
  statusText: String;
  headers: Record<string, string>;
  body: string | Buffer;
}