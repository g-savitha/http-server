import type { HttpRequest, HttpResponse } from '../types'
import * as pathModule from "path";
import { readFileSync, writeFileSync } from "fs";


export const handleFilesRequest = (request: HttpRequest, directory: string): HttpResponse => {
  const fileName = request.path.split('/')[2];
  const filePath = pathModule.join(directory, fileName);

  if (request.method === 'POST') {
    writeFileSync(filePath, request.body);
    return {
      statusCode: 201,
      statusText: 'Created',
      headers: {},
      body: ''
    };
  }
  try {
    const fileContent = readFileSync(filePath);
    return {
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileContent.length.toString()
      },
      body: fileContent
    }

  }
  catch (error) {
    return {
      statusCode: 404,
      statusText: 'Not Found',
      headers: {},
      body: ''
    };
  }
}