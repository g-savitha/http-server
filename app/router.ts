import type { HttpRequest, HttpResponse } from "./types";
import { handleEchoRequest, handleFilesRequest, handleUserAgentRequest } from './handlers'
export const routeRequest = (request: HttpRequest): HttpResponse => {
  let response: HttpResponse;
  const route = request.path.split('/')[1];
  switch (route) {
    case '':
      response = { statusCode: 200, statusText: 'OK', headers: {}, body: '' };
      break;
    case 'echo':
      response = handleEchoRequest(request.path, request.headers);
      break;
    case 'user-agent':
      response = handleUserAgentRequest(request.headers);
      break;
    case 'files':
      const [_, directory] = process.argv.slice(2);
      response = handleFilesRequest(request, directory);
      break;
    default:
      response = { statusCode: 404, statusText: 'Not Found', headers: {}, body: '' }
  }
  return response;
}