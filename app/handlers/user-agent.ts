import type { HttpResponse } from '../types'

export const handleUserAgentRequest = (headers: Record<string, string>): HttpResponse => {
  const userAgent = headers['User-Agent'];
  return {
    statusCode: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': userAgent.length.toString()
    },
    body: userAgent
  };
}