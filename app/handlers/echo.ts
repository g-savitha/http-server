import { gzipSync } from "zlib";
import type { HttpResponse } from '../types'

export const handleEchoRequest = (path: string, headers: Record<string, string>): HttpResponse => {
  const echoText = path.split('/')[2];
  const baseHeaders = {
    'Content-Type': 'text/plain',
  }

  const acceptEncoding = headers['Accept-Encoding'];
  const hasGzipEncoding = acceptEncoding === 'gzip' || acceptEncoding?.split(',').map(enc => enc.trim()).includes('gzip');

  if (hasGzipEncoding) {
    const textBuffer = Buffer.from(echoText, 'utf8');
    const compressedBody = gzipSync(textBuffer);
    return {
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'Content-Encoding': 'gzip',
        ...baseHeaders,
        'Content-Length': compressedBody.length.toString(),
      },
      body: compressedBody
    }
  }
  return {
    statusCode: 200,
    statusText: 'OK',
    headers: {
      ...baseHeaders,
      'Content-Length': echoText.length.toString()
    },
    body: echoText
  };
}