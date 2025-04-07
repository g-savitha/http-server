import type { HttpRequest, HttpResponse } from './types'

export const parseRequest = (data: Buffer): HttpRequest => {
  const [requestLine, ...headerLines] = data.toString().split("\r\n");
  const [method, path] = requestLine.split(" ");
  const [body] = headerLines.splice(headerLines.length - 1);

  const headers: Record<string, string> = {};
  headerLines.forEach(line => {
    const [key, value] = line.split(": ");
    if (key && value) {
      headers[key] = value;
    }
  });
  return { method, path, headers, body };
}
export const createResponse = (response: HttpResponse): Buffer => {
  const { statusCode, statusText, headers, body } = response;
  let headerString = `HTTP/1.1 ${statusCode} ${statusText}\r\n`;

  Object.entries(headers).forEach(([key, value]) => {
    headerString += `${key}: ${value}\r\n`
  });

  headerString += `\r\n`;

  const headerBuffer = Buffer.from(headerString);
  const bodyBuffer = typeof body === 'string' ? Buffer.from(body) : body;

  return Buffer.concat([headerBuffer, bodyBuffer || Buffer.alloc(0)])
}